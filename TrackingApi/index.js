// index file for Tracking_Api

// Have to do 
/*

create the location  
    -drivers location to pickup
    -pickup to drop
    -react link for Users

*/



const express = require('express');
const app = express();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Tracking Api is running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
    process.exit(1); 
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
