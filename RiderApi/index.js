// // index file for Rider_Api


// const webSocketServer = require('./websocket/webSocketServer');
// const bookingService = require('./websocket/bookingServiceClient');

// const express = require('express');
// const app = express();


// const PORT = process.env.PORT || 8003;

// const server = app.listen(PORT, () => {
//   console.log(`Rider_Api Service is running on port ${PORT}`);
// });



// // Start the WebSocket server
// webSocketServer.start();

// // Connect to the Booking Service
// bookingService.connect();

// app.use('/v1/initiate-login', require('./routes/v1/initiate-login'));
// app.use('/v1/validate-otp', require('./routes/v1/validate-otp'));
// app.use('/v1/rider-ws-auth', require('./routes/v1/rider-ws-auth'));

// server.on('error', (err) => {
//   if (err.code === 'EADDRINUSE') {
//     console.error(`Port ${PORT} is already in use. Please choose a different port.`);
//     process.exit(1); // Exit the process with a failure code
//   } else {
//     console.error('Server error:', err);
//     process.exit(1);
//   }
// });













// index.js
const { startWebSocketServer } = require('./websocket/webSocketServer'); // Correct function name
const { connectToBookingService } = require('./websocket/bookingServiceClient');

const express = require('express');
const app = express();

const PORT = process.env.PORT || 8003;

const server = app.listen(PORT, () => {
  console.log(`Rider_Api Service is running on port ${PORT}`);
});

// Connect to the Booking Service and pass the WebSocket instance to the server
const bookingWs = connectToBookingService();
startWebSocketServer(bookingWs); // Correctly pass bookingWs

app.use('/v1/initiate-login', require('./routes/v1/initiate-login'));
app.use('/v1/validate-otp', require('./routes/v1/validate-otp'));
app.use('/v1/rider-ws-auth', require('./routes/v1/rider-ws-auth'));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
    process.exit(1); // Exit the process with a failure code
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
