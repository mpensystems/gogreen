const express = require("express");

const router = express.Router();

const utilsRoutes = require('../v1/utilsRoutes');

// const app = express();

// app.use(express.json());

router.use('/utils', utilsRoutes);
router.use('/rider/accept-booking', require('../v1/rider-api/accept-booking'));
router.use('/unity/get-booking', require('../v1/unity-api/get-booking'));
router.use('/db/fetch', require('../v1/db-api/data-fetch'));
router.use('/db/insert', require('../v1/db-api/insert-data'));


module.exports = router;