const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ].filter(Boolean),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("chat:join", ({ sessionId }) => {
      socket.join(`session:${sessionId}`);
    });

    socket.on("agent:join", ({ agentId }) => {
      socket.join(`agent:${agentId}`);
      console.log(`Agent ${agentId} joined personal room`);
    });

    socket.on("ticket:join", ({ ticketId }) => {
      socket.join(`ticket:${ticketId}`);
    });

    socket.on("ticket:leave", ({ ticketId }) => {
      socket.leave(`ticket:${ticketId}`);
    });

    socket.on("disconnect", () => {});
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io is not initialized");
  return io;
}

module.exports = { initSocket, getIO };
