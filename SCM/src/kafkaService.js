const kafka = require('kafka-node')

const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_URL });
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

module.exports = { broadcastNewBooking}