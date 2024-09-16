const express = require("express");
// const { convertLatLngToH3 } = require("../controllers/h3IndexController");

const router = express.Router();

const biddingRoutes = require('../routes/biddingRoutes')
const h3IndexRoutes = require('../routes/h3IndexRoutes');
// const bookingRoutes = require('../../routes/v1/bookingRoutes');

// const app = express();

// app.use(express.json());

// router.use('/convertLatLngToH3', convertLatLngToH3);
router.use('/h3IndexRoutes', h3IndexRoutes);
router.use('/biddingRoutes',biddingRoutes);
// router.use('/booking', bookingRoutes);


module.exports = router;