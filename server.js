const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const PORT = 5000;

// --- Handle signaling logic ---
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Relay offer
  socket.on("offer", ({ targetId, offer }) => {
    io.to(targetId).emit("offer", { senderId: socket.id, offer });
  });
// Server-side example (Node.js + socket.io)
socket.on("join-room", ({ roomId }) => {
  socket.join(roomId);
  const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
  const otherClients = clients.filter(id => id !== socket.id);

  // Tell new user who is already in the room
  socket.emit("existing-users", { users: otherClients });

  // Notify others that a new user has joined
  socket.to(roomId).emit("user-joined", { peerId: socket.id });
});

  // Relay answer
  socket.on("answer", ({ targetId, answer }) => {
    io.to(targetId).emit("answer", { senderId: socket.id, answer });
  });

  // Relay ICE candidates
  socket.on("ice-candidate", ({ targetId, candidate }) => {
    io.to(targetId).emit("ice-candidate", { senderId: socket.id, candidate });
  });

  // On disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    io.emit("user-disconnected", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});
