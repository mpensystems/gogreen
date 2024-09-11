// index file for SCM

// Have to do 
/*

Converting lat and lng to H3index
Creating Kafka Topic for each H3Index
Authentication && Authorization
calling DMM to update Data in MongoDb & redis




*/



const express = require('express');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 8002;
const allRoutes = require("./routes/v1/index");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(PORT, () => {
  console.log(`SCM Service is running on port ${PORT}`);
});


app.use('/v1', allRoutes);
 
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
    process.exit(1); // Exit the process with a failure code
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
