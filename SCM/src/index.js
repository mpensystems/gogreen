const express = require("express");
const connectDB = require("../src/db/db.js");
const cors = require('cors');
const allRoutes = require('../src/routes/v1/index.js');
const multer = require('multer');
const webSocketServer = require('./controllers/websocket/webSocketServer.js'); 
const { fetch } = require('../src/db/fetch.js'); 

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



// app.post('/api/fetch-data', async (req, res) => {
//     console.log("req.body : ",req.body);
//     const query = req.body; // Expect the query to be sent in the request body
  
//     try {
//       // Use the fetch function to get the data
//       const result = await fetch(query);
//       res.status(200).json(result); // Send the data back as JSON
//     } catch (error) {
//       res.status(500).json({ error: 'Error fetching data', details: error.message });
//     }
//   });




app.use('/v1', allRoutes);




const server = app.listen(PORT,()=>{
    console.log(`SERVER STARTED SUCCESSFULLY ON PORT ${PORT}`)
})

// connectDB();
connectDB.connectToMongo();
webSocketServer.startWebSocketServer(server);