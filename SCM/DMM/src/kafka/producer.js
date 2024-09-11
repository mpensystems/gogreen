const { producer } = require('../config/kafkaConfig'); 

const sendBookingSelection = async (riderId, bookingId) => {
console.log("inside producer");
  await producer.connect();
  
  await producer.send({
    topic: 'booking-selections', // Topic where messages are sent 
    messages: [
      { value: JSON.stringify({ riderId, bookingId }) },
    ],
  });
  console.log("sent producer data");

  await producer.disconnect();
};

module.exports = { sendBookingSelection };
