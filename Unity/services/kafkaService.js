const kafka = require('kafka-node')

const client = new kafka.KafkaClient({ kafkaHost: '134.209.149.111:29092' });
const Producer = kafka.Producer;
const producer = new Producer(client);

producer.on('ready', () => {
    console.log('Producer is ready');
})

const broadcastNewBooking = (booking) => {
    producer.send([{
        topic: 'new-bookings',
        messages: [JSON.stringify({cmd: 'new-booking', p: booking})]
    }], (err, data) => {
        console.error(err);
        console.log(data);
    })
}

const broadcastBidChange = (bidConfig) => {
    producer.send([{
        topic: 'booking-bids',
        messages: [JSON.stringify({cmd: 'bid-change', p: bidConfig})]
    }], (err, data) => {
        console.error(err);
        console.log(data);
    })
}

module.exports = { broadcastNewBooking, broadcastBidChange }


// client.loadMetadataForTopics(['booking-bids'],function(err, resp) {
//     console.log(err);
//     console.log(resp);
// }) //will create the channel if it does not already exist

// client.createTopics([{
//     topic: 'new-bookings',
//     partitions: 1,
//     configEntries: [
//         {
//             name: 'retention.ms',
//             value: 1000 * 60 * 10 //10 mins
//         }
//     ]
// }], (err, result) => {
//     console.log('Error: ' + err);
//     console.log('Result: ' + JSON.stringify(result));
// })

// const createTopic = (h3i) => new Promise(resolve => {
//     // client.loadMetadataForTopics([],function(err, resp) {
//     //     console.log(JSON.stringify(resp));
//     //     resolve();
//     // })

//     client.createTopics([{
//         topic: 'bookings-test'
//         // configEntries: [
//         //     {
//         //         name: 'retention.ms',
//         //         value: 1000 * 60 * 10 //10 mins
//         //     }
//         // ]
//     }], (err, result) => {
//         console.log('Error: ' + err);
//         console.log('Result: ' + JSON.stringify(result));
//     })
// })
