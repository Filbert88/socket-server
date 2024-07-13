const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO server');
});

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

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
      messageId: data.messageId,
    });
    console.log(`Message emitted to rooms with appID: ${data.receiverAppID}`);
  });

  socket.on("unsendMessage", (data) => {
    console.log(`Unsending message with ID: ${data.messageId}`);
    io.to(data.senderAppID).emit("messageUnsent", {
      messageId: data.messageId,
      conversationId: data.conversationId,
    });
    if (data.senderAppID !== data.receiverAppID) {
      console.log("halo");
      io.to(data.receiverAppID).emit("messageUnsent", {
        messageId: data.messageId,
        conversationId: data.conversationId,
      });
    }
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
