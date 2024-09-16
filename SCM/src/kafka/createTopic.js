const { admin } = require('../config/kafkaConfig'); 

const createTopic = async () => {
  try {
    await admin.connect();
    console.log("admin connected !");

    // Define the topic configuration
    const topic = {
      topic: 'rider-selections', // Topic name
      numPartitions: 1, // Number of partitions
      replicationFactor: 1, // Replication factor
    };

    // Create the topic
    await admin.createTopics({
      topics: [topic],
    });

    console.log(`Topic '${topic.topic}' created successfully`);

  } catch (error) {
    console.error('Error creating topic:', error);
  } finally {
    await admin.disconnect();
  }
};

// Execute the topic creation
createTopic();
