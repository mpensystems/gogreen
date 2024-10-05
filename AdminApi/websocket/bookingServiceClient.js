// bookingServiceClient.js
const WebSocket = require('ws');
const { bookingServiceUrl } = require('./index'); // Configuration file

let bookingWs;

const connectToBookingService = () => {
  bookingWs = new WebSocket(bookingServiceUrl);

  bookingWs.on('open', () => {
    console.log('Connected to Booking Service');
  });

  bookingWs.on('error', (error) => {
    console.error('Booking Service WebSocket error:', error);
  });

  return bookingWs; // Return the WebSocket instance
};

module.exports = { connectToBookingService, bookingWs };
