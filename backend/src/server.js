require("dotenv").config(); // must be FIRST

const http = require("http");
const { Server } = require("socket.io");

const { connectPrisma } = require("./config/prisma");
const app = require("./app");

const PORT = process.env.PORT || 5000;

// create http server
const server = http.createServer(app);

// 🔥 DO NOT export io directly
let io;

// initialize socket
function initSocket() {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  app.set("io", io); // ✅ attach to app so controllers can access via req.app.get("io")

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

// 🔥 safe getter
function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

// start server
async function startServer() {
  await connectPrisma();

  initSocket(); // 👈 initialize BEFORE listen

  server.listen(PORT, () => {
    console.log(`server starts at port ${PORT}`);
  });
}

startServer();

// export ONLY getter — kept for any legacy use, but controllers should use req.app.get("io")
module.exports = { getIO };