import { createServer } from "http";
import { Server } from "socket.io";

const server = createServer();
const io = new Server(server, {
  path: "/api/socket",
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected on Vercel: ${socket.id}`);

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
    console.log(`Message in ${roomId} (Vercel):`, message);
    
    // Broadcast the message to all clients in the room (including sender)
    io.to(roomId).emit("message", message);
  });

  // Typing indicators
  socket.on("typing", (data) => {
    const { roomId, userId, userName, isTyping } = data;
    socket.to(roomId).emit("user-typing", { userId, userName, isTyping });
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected on Vercel: ${socket.id}`);
  });
});

export default server;
