// webSocketServer.js
const WebSocket = require('ws');

const startWebSocketServer = (server) => {
  // Create the WebSocket server on top of the same server as Express
  const wss = new WebSocket.Server({ server, path: '/ws' }); // Attach WebSocket to existing HTTP server

  wss.on('connection', (ws) => {
    console.log('New connection from Rider Service');

    ws.on('message', (message) => {
      console.log("Received message from Rider Service %s: ", message);

      ws.send("riders location received");
      // Here, you can process the rider's location data (message)
      // and potentially perform operations like updating bookings
    });

    // ws.on('close', () => {
    //   console.log('Rider Service disconnected');
    // });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('Booking Service WebSocket server is running on ws://localhost:8082');
};

module.exports = { startWebSocketServer };








