// const { Kafka } = require('kafkajs');

// // Initialize Kafka client
// const kafka = new Kafka({
//   clientId: 'go-green-client', 
//   brokers: ['localhost:9092'], 
// });

// const admin = kafka.admin();

// module.exports = { kafka, admin };







const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'go-green-client', // Unique client ID for your application
  brokers: ['localhost:9092'], 
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'go-green-group' });
const admin = kafka.admin();

module.exports = { kafka, producer, consumer, admin };
