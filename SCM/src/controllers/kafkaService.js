const kafka = require('kafka-node')
//     Producer = kafka.Producer,
//     client = new kafka.KafkaClient(),
//     producer = new Producer(client);

const client = new kafka.KafkaClient({kafkaHost: '134.209.149.111:9092'});

const createTopic = (h3i) => new Promise(resolve => {
    // client.loadMetadataForTopics([],function(err, resp) {
    //     console.log(JSON.stringify(resp));
    //     resolve();
    // })

    client.createTopics([{
        topic: 'bookings-test'
        // configEntries: [
        //     {
        //         name: 'retention.ms',
        //         value: 1000 * 60 * 10 //10 mins
        //     }
        // ]
    }], (err, result) => {
        console.log('Error: ' + err);
        console.log('Result: ' + JSON.stringify(result));
    })
})

const publishBooking = (h3i, booking) => {

}

module.exports = {createTopic}