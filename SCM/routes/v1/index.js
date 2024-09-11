const express = require("express");

const router = express.Router();

const utilsRoutes = require('../v1/utilsRoutes');

// const app = express();

// app.use(express.json());

router.use('/utils', utilsRoutes);


module.exports = router;