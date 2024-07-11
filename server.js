// Import necessary libraries
const http = require('http');
const { Server } = require('socket.io');

// Define the port to run the server on
const PORT = process.env.PORT || 3000;

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO server');
});

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",  // Be sure to restrict this in production!
    methods: ["GET", "POST"]
  }
});

// Handle connection events and set up your Socket.IO logic
io.on('connection', (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (appID) => {
    socket.join(appID);
    console.log(`User with appID ${appID} joined their room`);
  });

  socket.on("sendMessage", (data) => {
    console.log(`Message from ${data.senderID} to ${data.receiverID}: "${data.message}"`);
    io.to(data.receiverAppID).emit("receiveMessage", {
      message: data.message,
      senderID: data.senderID,
      receiverID: data.receiverID,
      timestamp: new Date(),
    });
    console.log(`Message emitted to rooms with appID: ${data.receiverAppID}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
