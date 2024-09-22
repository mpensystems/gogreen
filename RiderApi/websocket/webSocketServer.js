// // webSocketServer.js
// const WebSocket = require("ws");

// const wss = new WebSocket.Server({ port: 8081 });

// const startWebSocketServer = (bookingWs) => {
//   wss.on("connection", (ws) => {
//     console.log("New rider connected");

//     const initialMessage = JSON.stringify({
//       message: "Welcome, rider! You are now connected.",
//     });
//     ws.send(initialMessage);
//     ws.on("message", (message) => {
//       const receivedMessage = message.toString();
//       console.log("Received rider location:", receivedMessage);

//       // Forward the rider's location to the Booking Service
//       if (bookingWs && bookingWs.readyState === WebSocket.OPEN) {
//         bookingWs.send(message);
//       }
//     });

//     ws.on("close", () => {
//       console.log("Rider disconnected");
//     });

//     ws.on("error", (error) => {
//       console.error("Rider WebSocket error:", error);
//     });
//   });

//   console.log(
//     "Rider Service WebSocket server is running on ws://localhost:8081"
//   );
// };

// module.exports = { startWebSocketServer };
















const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8085 });

// Store rider connections
const riders = new Map();

wss.on('connection', (ws) => {
    console.log('Rider connected.');

    // Handle incoming messages from the rider (e.g., rider location updates)
    ws.on('message', (message) => {
        const riderData = JSON.parse(message);
        const { riderId, lat, lng } = riderData;

        // Store rider's connection and location
        riders.set(riderId, { ws, lat, lng });
        console.log(`Rider ${riderId} location updated: (${lat}, ${lng})`);
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log('Rider disconnected.');
        // Remove the rider from the map
        for (let [riderId, rider] of riders) {
            if (rider.ws === ws) {
                riders.delete(riderId);
            }
        }
    });
});

module.exports = wss;
