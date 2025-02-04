const { Server } = require("socket.io");
const dotenv = require("dotenv");

dotenv.config({ path: "flights-back/config/.env" });

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = initSocket;