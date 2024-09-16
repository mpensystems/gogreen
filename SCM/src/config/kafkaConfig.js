const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'go-green-client',
  brokers: ['localhost:9092'] 
});

const admin = kafka.admin();
const producer = kafka.producer();


//  Connect to Kafka.

const connectKafka = async () => {
  await admin.connect();
  console.log("kafka connected successfully");
  await producer.connect();
  console.log("kafka producer connected successfully");
};


 // Disconnect from Kafka.
 
const disconnectKafka = async () => {
  await admin.disconnect();
  await producer.disconnect();
};

/**
 * Create a Kafka topic for the specified H3 index.
 * @param {string} h3Index - H3 index to create a topic for
 */



const createKafkaTopic = async (h3Index) => {
  try {
    const topicName = `booking-area-${h3Index}`;
    
    // Check if the topic already exists
    const existingTopics = await admin.listTopics();
    if (existingTopics.includes(topicName)) {
      console.log(`Topic ${topicName} already exists.`);
      return;
    }

    // Create the topic
    const topicResponse = await admin.createTopics({
      topics: [{ 
        topic: topicName, 
        numPartitions: 1, 
        replicationFactor: 1 
      }],
      timeout:  60000, 
    });

    console.log("Topic creation response:", topicResponse);
    if (topicResponse) {
      console.log("Kafka topic created:", topicName);
    } else {
      console.log("Kafka topic creation skipped:", topicName);
    }
  } catch (error) {
    console.error("Error creating Kafka topic:", error);
  }
};




/**
 * Produce a message to the specified Kafka topic.
 * @param {string} topic - Kafka topic name
 * @param {object} message - The message to send
 */

const produceMessage = async (topic, message) => {
  // console.log("topic in producer : ",topic,message);
  await producer.send({
    topic: topic,
    messages: [{ value: JSON.stringify(message) }],
  });

};



module.exports = {
  connectKafka,
  disconnectKafka,
  createKafkaTopic,
  produceMessage,
};
