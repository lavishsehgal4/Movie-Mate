const http = require("http");
const { connectPrisma } = require("./config/prisma");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function startServer() {
  await connectPrisma();
  server.listen(PORT, () => {
    console.log(`server starts at port ${PORT}`);
  });
}

startServer();
