const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Next.js handles normal HTTP requests
    handle(req, res);
  });

  // Attach Socket.IO to the same server
  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a direct message room or group room
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Leave a room
    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Send chat message
    socket.on("send-message", (data) => {
      const { roomId, message } = data;
      console.log(`Message in ${roomId}:`, message);
      
      // Broadcast the message to all clients in the room (including sender)
      io.to(roomId).emit("message", message);
    });

    // Typing indicators
    socket.on("typing", (data) => {
      const { roomId, userId, userName, isTyping } = data;
      socket.to(roomId).emit("user-typing", { userId, userName, isTyping });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
