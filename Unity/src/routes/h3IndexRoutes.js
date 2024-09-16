const express = require('express');
const router = express.Router();


const { convertLatLngToH3 } = require('../controllers/h3IndexController');

router.post('/convertLatLngToH3',convertLatLngToH3);

module.exports = router;