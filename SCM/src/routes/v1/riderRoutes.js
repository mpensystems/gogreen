const express = require('express');
const router = express.Router();


const { UpdateRider } = require("../../controllers/riderController/updateRider");
const {createRider} = require('../../controllers/riderController/addRider');
const {deleteRider} = require("../../controllers/riderController/dateleRider");
const {getRider ,getAllRiders} = require("../../controllers/riderController/getRiders");
const { selectBooking } = require('../../controllers/riderController/selectBooking');
const { subscribeToRiderChannels } = require('../../kafka/kafkaService');
const { fetch } = require('../../db/fetch');
const { insert } = require('../../db/insert');

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



  router.post('/api/fetch-data', async (req, res) => {
    console.log("req.body : ", req.body);
    const query = req.body;
    try {
      const result = await fetch(query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching data', details: error.message });
    }
  });


  router.post('/api/insert-data', async (req, res) => {
    console.log("req.body : ", req.body);
    const query = req.body;
    try {
      const result = await insert(query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching data', details: error.message });
    }
  });
  
  

module.exports = router;