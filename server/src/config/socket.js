const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("chat:join", ({ sessionId }) => {
      socket.join(`session:${sessionId}`);
    });

    socket.on("disconnect", () => {});
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io is not initialized");
  return io;
}

module.exports = { initSocket, getIO };
