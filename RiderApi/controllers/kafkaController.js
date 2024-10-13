// import kafka from 'kafka-node';

// const client = new kafka.KafkaClient({ kafkaHost: '134.209.149.111:29092'});
// const Consumer = kafka.Consumer;

// console.log('URL: ' + process.env.KAFKA_URL);

// export const consumer = new Consumer(client, [{topic: 'booking-bids'}, {topic: 'new-bookings'}]);
// consumer.on('message', (message) => {
//     let value = JSON.parse(message.value);
//     console.log(JSON.stringify(value));
//     switch(value.cmd) {
//         case 'bid-change':
//             console.log('Bid has changed');
//     }
// })

// consumer.on('error', (err) => {
//     console.error(err);
// })