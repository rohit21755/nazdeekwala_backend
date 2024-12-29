const env = require("dotenv");
const socketIo = require("socket.io");
const { SocketService } = require("./socket.js");
//config
env.config({ path: "config/config.env" });

const app = require("./app");

const connectDatabase = require("./config/database");

//connecting to DB
connectDatabase();
console.log(process.env.PORT);

const server = app.listen(8000, () => {
  console.log(`Server is  running on http://localhost:${process.env.PORT}`);
});

// Initialize WebSocket server
const socketService = new SocketService(server);
socketService.initSocket();

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
