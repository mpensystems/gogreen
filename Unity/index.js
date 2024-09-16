
const express = require('express');
const cron = require('./crons')
const app = express();
const allRoutes = require('./src/routes/index');
require('dotenv').config();

const PORT = process.env.PORT || 8000;
console.log("check port ",process.env.PORT);

app.use(express.json());


app.use('/v1', allRoutes);

const server = app.listen(PORT, () => {
  console.log(`Unity Api is running on port ${PORT}`);
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
