import {startWebSocketServer} from './websocket/webSocketServer.js'; // Correct function name
import {connectToBookingService} from './websocket/bookingServiceClient.js';

import express from 'express';
const app = express();
import { initiateLogin, validateOtp } from './routes/v1/login.js';
import { fetchKyc, updateKyc } from './routes/v1/kyc.js';
import pkg from 'body-parser';
const {json} = pkg;
import {config} from 'dotenv'
config();
import {upload, handleKycDocUpload, fetchKycDoc} from './controllers/filemanager.js'

const PORT = process.env.PORT || 8003;

const server = app.listen(PORT, () => {
  console.log(`Rider_Api Service is running on port ${PORT}`);
});

// Connect to the Booking Service and pass the WebSocket instance to the server
// const bookingWs = connectToBookingService();
// startWebSocketServer(bookingWs); // Correctly pass bookingWs


// webSocketServer.start();

// // Connect to the Booking Service
// bookingService.connect();

// const webSocketServer = require('./websocket/webSocketServer');
// const bookingService = require('./websocket/bookingServiceClient');

app.use(json());

app.post('/v1/initiate-login', initiateLogin);
app.use('/v1/validate-otp', validateOtp);
app.use('/v1/rider/fetch-kyc', fetchKyc);
app.use('/v1/rider/update-kyc', updateKyc);
// app.use('/v1/rider-ws-auth', require('./routes/v1/rider-ws-auth'));

app.post('/v1/rider/upload-kyc-doc', upload.single('file'), handleKycDocUpload);
app.get('/v1/rider/view-kyc-doc/:fileid', fetchKycDoc);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
    process.exit(1); // Exit the process with a failure code
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});