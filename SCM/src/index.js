const express = require("express");
const connectDB = require("../src/db/db.js");
const cors = require('cors');
const allRoutes = require('../src/routes/v1/index.js');
const multer = require('multer');



const app = express();
const PORT = 8080 ;
app.use(cors());


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer();
app.use(upload.none());



// const  riderRoutes = require('./routes/v1/rider/riderRoutes.js');
// const allRoutes = require('./routes/v1/index.js');
// app.use('/v1/routes', riderRoutes);

app.use('/v1', allRoutes);


app.listen(PORT,()=>{
    console.log(`SERVER STARTED SUCCESSFULLY ON PORT ${PORT}`)
})

connectDB();