const express = require('express');
const router = express.Router();


const { UpdateRider } = require("../../controllers/riderController/updateRider");
const {createRider} = require('../../controllers/riderController/addRider');
const {deleteRider} = require("../../controllers/riderController/dateleRider");
const {getRider ,getAllRiders} = require("../../controllers/riderController/getRiders");
const { selectBooking } = require('../../controllers/riderController/selectBooking');
const { subscribeToRiderChannels } = require('../../kafka/kafkaService');

router.put('/updateRider/:riderId', UpdateRider );
router.get('/getRider/:riderId',getRider);
router.get('/getAllRiders',getAllRiders);
router.post('/addUser',createRider);
router.delete('/deleteRider/:riderId',deleteRider);
router.put('/selectBooking/:bookingId',selectBooking);
router.post('/subscribe', (req, res) => {
    const { riderId, riderLat, riderLng } = req.body;
    
    console.log("Rider ID:", riderId);
    console.log("Rider Latitude:", riderLat);
    console.log("Rider Longitude:", riderLng);
  
    // Call the subscription function
    subscribeToRiderChannels(riderId, riderLat, riderLng)
      .then(() => res.send('Subscribed to relevant channels.'))
      .catch(err => {
        console.error('Error subscribing to channels:', err);
        res.status(500).send('Failed to subscribe to channels.');
      });
  });
  

module.exports = router;