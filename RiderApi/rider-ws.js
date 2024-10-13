
import { createHash } from 'crypto';
import { WebSocketServer } from 'ws';
import { post } from './api.js';
import { SCM_DB_FETCH, SCM_DB_INSERT } from './urls.js';
import { latLngToCell } from "h3-js";
import { response } from 'express';
import { makeid } from './utils.js';
import kafka from 'kafka-node';

// Create a WebSocket server
export const wss = new WebSocketServer({ port: 9000 });
const riderMap = new Map(); //rid => web socket object
const h3iMap = new Map(); //h3i => array of riders

wss.on('connection', (ws) => {
    console.log('Rider WS connected.');

    let rid;
    let h3i;

    // Handle incoming messages from the rider (e.g., rider location updates)
    ws.on('message', async (message) => {
        try {
            const { cmd, id, p } = JSON.parse(message);

            if (rid == null && cmd != 'auth') {
                ws.send({ cmd: 'error', error_code: 'ER408' });
                return ws.close();
            }

            switch (cmd) {
                case 'auth':
                    if (rid != undefined) return ws.send(JSON.stringify({ cmd: 'error', error_code: 'ER408', error_message: 'Cannot reattempt auth' }));
                    rid = await processAuth(id, p);
                    riderMap.set(rid, ws);
                    ws.send(JSON.stringify({ cmd: 'ack', id: id }));
                    break;
                case 'loc':
                    let newH3i = await processLoc(rid, p);
                    if (h3i != newH3i) {
                        await processH3iUpdate(h3i, newH3i, rid); //sync call
                        h3i = newH3i;
                        let bookings = await fetchBookingsForH3i(h3i);
                        send(ws, {
                            cmd: 'booking-list',
                            id: makeid(8),
                            p: {
                                h3i: h3i,
                                bookings: bookings
                            }
                        })
                    }
                    send(ws, { cmd: "ack", id: id });
                    break;
                default:
                    ws.close();
            }
        } catch (err) {
            console.error(err);
            ws.send(JSON.stringify(err));
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log(`Rider disconnected: ${rid}`);
        riderMap.delete(rid);
        if (h3i != null) {
            let arr = h3iMap.get(h3i);
            let index = arr.indexOf(rid);
            if (index != -1) {
                arr.splice(index, 1);
                // h3iMap.set(h3i, arr); //may not be required. Needs to be tested.
            }
        }
    });
});

//Start a kafka listener for messages to send on the sockets
const client = new kafka.KafkaClient({ kafkaHost: '134.209.149.111:29092' });
const Consumer = kafka.Consumer;
export const consumer = new Consumer(client, [{ topic: 'booking-bids' }, { topic: 'new-bookings' }]);
consumer.on('message', (message) => {
    let value = JSON.parse(message.value);
    switch (value.cmd) {
        case 'bid-change':
            broadcastBidChange(value.p);
            break;
        case 'new-booking':
            broadcastNewBooking(value.p);
            break;
    }
})

consumer.on('error', (err) => {
    console.log('Error on Kafka consumer');
    console.error(err);
})

const processAuth = (id, p) => new Promise(async (resolve, reject) => {
    let authHash = createHash('md5').update(p.auth).digest('hex')
    let stHash = createHash('md5').update(p.st).digest('hex')
    let results = await post(SCM_DB_FETCH, {
        db: 'redis',
        table: 'RiderWsAuth',
        id: authHash
    })

    if (results.length == 0) return reject({ cmd: 'error', error_code: 'ER408' })
    let x = results[0];
    if (x.stHash == stHash) return resolve(x.rid);
    else return reject({ cmd: 'error', error_code: 'ER408' })
});

const processLoc = (rid, p) => new Promise(async (resolve, reject) => {
    let lat = p.lat;
    let lng = p.lng;

    if (lat == null || lat == 0.0) return reject({ cmd: 'error', error_code: 'ER704,p.lat' });
    if (lng == null || lng == 0.0) return reject({ cmd: 'error', error_code: 'ER704,p.lng' });

    let h3i = latLngToCell(lat, lng, 9);

    await post(SCM_DB_INSERT, {
        db: 'redis',
        table: 'RiderLoc',
        rows: [
            {
                key: rid,
                value: {
                    lat: lat,
                    lng: lng,
                    h3i: h3i,
                    update_at: Date.now()
                },
                expiry: 2 * 60 // 2 minutes
            }
        ]
    })

    resolve(h3i)
});

const processH3iUpdate = (oldH3i, newH3i, rid) => new Promise(async (resolve) => {
    let oldRiders = h3iMap.get(oldH3i);
    if (oldRiders != null && oldRiders.indexOf(rid) != -1) {
        oldRiders.splice(oldRiders.indexOf(rid), 1);
        h3iMap.set(oldH3i, oldRiders);
    }

    if (!h3iMap.has(newH3i)) h3iMap.set(newH3i, []);
    let newRiders = h3iMap.get(newH3i);
    newRiders.push(rid);
    h3iMap.set(newH3i, newRiders);
    resolve();
})

const fetchBookingsForH3i = (h3i) => new Promise(async (resolve) => {
    let rows = await post(SCM_DB_FETCH, {
        db: 'redis',
        table: 'Grid',
        id: h3i
    })

    if (rows.length == 0) return resolve([]);
    let bids = rows[0].bids.split(',');
    let promises = bids.map(bid => new Promise(async (resolve) => {
        try {
            let result = await post(SCM_DB_FETCH, {
                db: 'mongo',
                table: 'Bookings',
                q: {
                    bid: bid
                }
            })

            if (result.length == 0) resolve(null);
            else resolve(result[0]);
        } catch (err) {
            console.error(err);
            resolve(null);
        }
    }))

    let bookings = await Promise.all(promises);
    bookings = bookings.filter(x => x != null);
    bookings = bookings.map(x => {
        delete x._id;
        return x;
    })
    resolve(bookings);
})

const send = (ws, obj) => ws.send(JSON.stringify(obj));

const broadcastNewBooking = (booking) => new Promise(async (resolve) => {
    let id = makeid(6);
    let h3is = Array.isArray(booking.bidConfig.h3is) ? booking.bidConfig.h3is : booking.bidConfig.h3is.split(',');
    h3is.forEach(h3i => {
        let rids = h3iMap.get(h3i);
        if (rids == null) return;
        rids.forEach(rid => {
            const ws = riderMap.get(rid);
            if (ws == null) return;
            send(ws, {
                cmd: 'new-booking',
                id: id,
                p: booking
            })
        })
    })
    resolve();
})

const broadcastBidChange = (bidConfig) => new Promise(async (resolve) => {
    let id = makeid(6);
    let h3is = Array.isArray(bidConfig.h3is) ? bidConfig.h3is : bidConfig.h3is.split(',');
    if(bidConfig.h3is == null) return resolve();
    h3is.forEach(h3i => {
        let rids = h3iMap.get(h3i);
        if (rids == null) return;
        rids.forEach(rid => {
            const ws = riderMap.get(rid);
            if (ws == null) {
                return;
            }
            send(ws, {
                cmd: 'bid-change',
                id: id,
                p: bidConfig
            })
        })
    })
    resolve();
})