const env = require("dotenv");
const { Server } = require("ws");  // Use the 'ws' WebSocket server
const { UnifiedSocket } = require("./socket");
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

// WebSocket server
const unifiedSocket = new UnifiedSocket(server);
unifiedSocket.initSocket();



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
