const express = require('express');
const router = express.Router();


const { UpdateRider } = require("../../controllers/riderController/updateRider");
const {createRider} = require('../../controllers/riderController/addRider');
const {deleteRider} = require("../../controllers/riderController/dateleRider");
const {getRider ,getAllRiders} = require("../../controllers/riderController/getRiders");
const { selectBooking } = require('../../controllers/riderController/selectBooking');

router.put('/updateRider/:riderId', UpdateRider );
router.get('/getRider/:riderId',getRider);
router.get('/getAllRiders',getAllRiders);
router.post('/addUser',createRider);
router.delete('/deleteRider/:riderId',deleteRider);
router.put('/selectBooking/:bookingId',selectBooking);


module.exports = router;