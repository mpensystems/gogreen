var api = require('./api.js');
const URLS = require('./urls.js');

//Clean the grid table
// (async () => {
//     let h3is = await api.post(URLS.SCM_DB_FETCH, {
//         db: 'redis',
//         table: 'Grid',
//         id: '*',
//         keysOnly: true
//     })

//     console.log(`h3is: ${h3is.length}`);

//     await api.post(URLS.SCM_DB_DELETE,{
//         db: 'redis',
//         table: 'Grid',
//         ids: h3is
//     })
// })();


//Delete all trips
// (async () => {
//     let trips = await api.post(URLS.SCM_DB_FETCH, {
//         db: 'mongo',
//         table: 'Trips'
//     })

//     console.log(`Trips: ${trips.length}`);

//     trips.forEach(trip => {
//         api.post(URLS.SCM_DB_DELETE, {
//             db: 'mongo',
//             table: 'Trips',
//             condition: {
//                 tid: trip.tid
//             }
//         })
//     })
// })();


//Delete all bookings
// (async () => {
//     let bookings = await api.post(URLS.SCM_DB_FETCH, {
//         db: 'mongo',
//         table: 'Bookings'
//     })

//     console.log(`Bookings: ${bookings.length}`);

//     bookings.forEach(booking => {
//         api.post(URLS.SCM_DB_DELETE, {
//             db: 'mongo',
//             table: 'Bookings',
//             condition: {
//                 bid: booking.bid
//             }
//         })
//     })
// })();

//delete all BookingBids
// (async () => {
//     let bids = await api.post(URLS.SCM_DB_FETCH, {
//         db: 'redis',
//         table: 'BookingBids',
//         id: '*',
//         keysOnly: true
//     })

//     console.log(`BidConfigs: ${bids.length}`);

//     bids.forEach(bid => {
//         api.post(URLS.SCM_DB_DELETE, {
//             db: 'redis',
//             table: 'BookingBids',
//             id: bid
//         })
//     })
// })();

//Clean the riders table
// (async () => {
//     let riders = await api.post(URLS.SCM_DB_FETCH, {
//         db: 'mongo',
//         table: 'Riders'
//     })

//     console.log(`Riders: ${riders.length}`);

//     riders.forEach(rider => {
//         api.post(URLS.SCM_DB_DELETE, {
//             db: 'mongo',
//             table: 'Riders',
//             condition: {
//                 rid: rider.rid
//             }
//         })
//     })
// })();