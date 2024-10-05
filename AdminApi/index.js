import {connectToBookingService} from './websocket/bookingServiceClient.js';

import express from 'express';
const app = express();
import { login, firstRegister, activationStatus, register } from './routes/v1/login.js';
import { updateProfile, getProfile } from './routes/v1/user-profile.js';
import pkg from 'body-parser';
const {json} = pkg;
import {config} from 'dotenv'
config();

const PORT = process.env.PORT || 8004;

const server = app.listen(PORT, () => {
  console.log(`Rider_Api Service is running on port ${PORT}`);
});

app.use(json());

app.post('/v1/login', login);
app.post('/v1/first-register', firstRegister);
app.post('/v1/user/register', register);
app.get('/v1/activation-status', activationStatus);

app.post('/v1/user/update-profile', updateProfile);
app.get('/v1/user/profile', getProfile);

// app.use('/v1/rider/fetch-kyc', fetchKyc);
// app.use('/v1/rider/update-kyc', updateKyc);
// app.get('/v1/kyc/view-doc/:fileid', fetchKycDoc);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
    process.exit(1); // Exit the process with a failure code
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});