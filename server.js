const env = require("dotenv");
const { Server } = require("ws");  // Use the 'ws' WebSocket server
const { SocketService } = require("./socket.js");
const InstaSocket = require("./instasocket.js");
//config
env.config({ path: "config/config.env" });

const app = require("./app");

const connectDatabase = require("./config/database");

//connecting to DB
connectDatabase();
console.log(process.env.PORT);

// Main HTTP server (used for app)
const server = app.listen(8000, () => {
  console.log(`Main server is running on http://localhost:${process.env.PORT}`);
});

// Initialize SocketService (WebSocket server for main server)
const socketService = new SocketService(server);
socketService.initSocket();

// Create a new HTTP server for InstaSocket (for the second WebSocket server)
const instaServer = require("http").createServer();
instaServer.listen(9000, () => {
  console.log(`InstaSocket server is running on http://localhost:9000`);
});

// Initialize InstaSocket on the new server
const instaSocket = new InstaSocket(instaServer);
instaSocket.initSocket();

// Error handling
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting Down the Server due to Uncaught Exception");
  server.close(() => {
    process.exit(1);
  });
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting Down the Server due to Unhandled Promise Rejections");
  server.close(() => {
    process.exit(1);
  });
});
