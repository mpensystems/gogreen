const { consumer } = require('../config/kafkaConfig'); 
const { stopBiddingProcess } = require('../controllers/bookingControllers/biddingService');


const runConsumer = async () => {
  await consumer.connect();
  console.log("inside consumer");

  await consumer.subscribe({ topic: 'booking-selections', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {

        console.log("inside consumer after receive ")
      const { riderId, bookingId } = JSON.parse(message.value.toString());

      console.log(`for topic as ${topic} ,and partitions ${partition}`);


      console.log(`Rider ${riderId} selected booking ${bookingId}`);

      // Call your function to stop the bidding process
      await stopBiddingProcess(bookingId);
    },
  });
};

// const stopBiddingProcess = async (bookingId) => {
//   // Implement your logic to stop the bidding process here
//   console.log(`Stopping bidding process for booking ${bookingId}`);
// };

runConsumer().catch(console.error);
