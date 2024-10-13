const express = require("express");

const router = express.Router();

// const riderRoutes = require('../../routes/v1/riderRoutes');
const bookingRoutes = require('../../routes/v1/bookingRoutes');
const dbInsert = require('../../../routes/v1/db-api/insert-data');
const dbDelete = require('../../../routes/v1/db-api/delete-data');
const dbFetch = require('../../../routes/v1/db-api/data-fetch');
const dbUpdate = require('../../../routes/v1/db-api/update-data');

// const app = express();

// app.use(express.json());



// router.use('/rider', riderRoutes);
router.use('/bookings', bookingRoutes);
router.use('/db/insert', dbInsert);
router.use('/db/delete', dbDelete);
router.use('/db/fetch', dbFetch);
router.use('/db/update', dbUpdate);

router.use('/config/sysconfig', require('../../../routes/v1/generic/sys-config'));
router.use('/config/compensation', require('../../../routes/v1/generic/compensation'));

module.exports = router;