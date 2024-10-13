import {connectToBookingService} from './websocket/bookingServiceClient.js';

import express from 'express';
const app = express();
import { login, firstRegister, activationStatus, register } from './routes/v1/login.js';
import { updateProfile, getProfile, changePassword } from './routes/v1/user-profile.js';
import { listUsers, getUserProfile, resetPassword, adminUpdateUserProfile } from './routes/v1/user-management.js';
import { createBooking } from './routes/v1/bookings.js';
import pkg from 'body-parser';
const {json} = pkg;
import {config} from 'dotenv';
import cors from 'cors';
config();

const PORT = process.env.PORT || 8004;

const server = app.listen(PORT, () => {
  console.log(`Admin_Api Service is running on port ${PORT}`);
});

app.use(json());
let corsOptions = {
  origin : ['*'],
}
app.use(cors(corsOptions));

app.post('/v1/login', login);
app.post('/v1/first-register', firstRegister);
app.post('/v1/user/register', register);
app.get('/v1/activation-status', activationStatus);

app.post('/v1/user/update-profile', updateProfile);
app.get('/v1/user/profile', getProfile);
app.post('/v1/user/change-password', changePassword);

app.get('/v1/user-mgmt/list-users', listUsers);
app.get('/v1/user-mgmt/:aid/profile', getUserProfile);
app.post('/v1/user-mgmt/:aid/reset-password', resetPassword);
app.post('/v1/user-mgmt/:aid/update-profile', adminUpdateUserProfile);

app.post('/v1/bookings/create', createBooking);

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