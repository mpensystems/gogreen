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
import { initiateRiderWsAuth } from './routes/v1/rider-ws-auth.js';
import { setStatus } from './routes/v1/trip.js';
import { wss } from './rider-ws.js';



// import {consumer} from './controllers/kafkaController.js' //required to activate kafka listener

// const kafka = require('kafka-node')
// //     Producer = kafka.Producer,
// //     client = new kafka.KafkaClient(),
// //     producer = new Producer(client);

// import kafka from 'kafka-node';

// const client = new kafka.KafkaClient({kafkaHost: '134.209.149.111:29092'});
// const Consumer = kafka.Consumer;

// const consumer = new Consumer(client, [{topic: 'booking-bids'}]);
// consumer.on('message', (message) => {
//   console.log('Received message: ' + JSON.stringify(message));
//  })

//  consumer.on('error', (err) => {
//   console.error(err);
//  })

const PORT = process.env.PORT || 8003;

const server = app.listen(PORT, () => {
  console.log(`Rider_Api Service is running on port ${PORT}`);
});

app.use(json());

app.post('/v1/initiate-login', initiateLogin);
app.use('/v1/validate-otp', validateOtp);
app.use('/v1/rider/fetch-kyc', fetchKyc);
app.use('/v1/rider/update-kyc', updateKyc);
app.use('/v1/rider-ws-auth', initiateRiderWsAuth);

app.post('/v1/rider/upload-kyc-doc', upload.single('file'), handleKycDocUpload);
app.get('/v1/rider/view-kyc-doc/:fileid', fetchKycDoc);


app.post('/v1/trips/:tid/set/:status/:substatus', setStatus);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
    process.exit(1); // Exit the process with a failure code
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});