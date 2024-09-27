const express = require("express");

const router = express.Router();

const riderRoutes = require('../../routes/v1/riderRoutes');
const bookingRoutes = require('../../routes/v1/bookingRoutes');
const dbInsert = require('../../../routes/v1/db-api/insert-data');

// const app = express();

// app.use(express.json());



router.use('/rider', riderRoutes);
router.use('/booking', bookingRoutes);
router.use('/db/insert', dbInsert);


module.exports = router;