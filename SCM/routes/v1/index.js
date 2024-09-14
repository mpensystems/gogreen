const express = require("express");

const router = express.Router();

const utilsRoutes = require('../v1/utilsRoutes');

// const app = express();

// app.use(express.json());

router.use('/utils', utilsRoutes);
router.use('/v1/rider/accept-booking', require('../v1/rider-api/accept-booking'));
router.use('/v1/unity/get-booking', require('../v1/unity-api/get-booking'));
router.use('/v1/db/fetch', require('../v1/db-api/data-fetch'));


module.exports = router;