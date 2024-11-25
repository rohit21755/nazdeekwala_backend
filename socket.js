const jwt = require("jsonwebtoken");
const { sendMessage } = require("./controllers/chatController.js");
const messageModel = require("./models/messagesModel");
const chatModel = require("./models/chatModel.js");
const myEmitter = require('./utils/event')

// const socketServer = (io)=>{
//     io.on("connection", socket =>{
//         socket.on('set up', (chatId)=> {
//             socket.add(chatId)

//         })
//         socket.on('send message', (data)=>{

//         })

//         socket.on('recived message', (data)=>{

//         })

//         socket.on('disconnect', ()=>{
//             socket.leave()
//         })
//     })
// }

class SocketService {
  constructor(socketIo) {
    this.io = socketIo;
  }

  initSocket() {
    this.io.on("connection", (socket) => {
      console.log('socket connected"');
      socket.on("set up", async (token) => {
        console.log(token);
        if(!token || !token.length) {
          socket.emit("error", "Token need")
          return ;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // const decoded = await jwt.verify(token, process.env.JWT_SECRET, (err, res)=> {
        //     console.log(err)

        // });
        console.log("decode", decoded);
        if (decoded) {
          socket._id = decoded._id;
        }
      });

      myEmitter.on('new order', async(data)=>{
        let {chatId} = data
        this.io.to(socket.chatId).emit("received message", data);

      })

      socket.on("join chat", async (chatId) => {
        //console.log("chatid")
        try {
          if (socket._id) {
            let chat = await chatModel.findById(chatId);
            if (!chat) {
              socket.emit("error", "Invalid ChatId");
              return;
            }
            socket.join(chatId);
            socket.chatId = chatId;
            socket.emit("success");
          }
        } catch (err) {
          socket.emit("error", err.message);
        }
      });
      socket.on("send message", async (data) => {
        try {
        let { message } = data;
        console.log("new msg");
        if (!socket._id || !socket.chatId) {
          socket.disconnect();
        }
        let msg = await sendMessage({
          _id: socket._id,
          chatId: socket.chatId,
          message,
        });
        this.io.to(socket.chatId).emit("received message", msg);
    }catch(err){
        socket.emit("error", err.message);

        }
      });
      socket.on("seen message", async (msgId) => {
        try{
        socket.broadcast.to(socket.chatId).emit("seen message");
        console.log(msgId);

        await messageModel.findByIdAndUpdate(msgId, { seen: true });
        await chatModel.findByIdAndUpdate(socket.chatId, { unSeenCount: 0 });
        }catch(err){
            socket.emit("error", err.message);
        }
      });

      socket.on("leave chat", (chatId) => {
        try{
        socket.leave(chatId);
        console.log("user leave chat");
        }catch(err){
            socket.emit("error", err.message);
        }
      });

      socket.on("disconnect", () => {
        console.log("socket disconnected");
        socket.disconnect();
      });
    });
  }
}

module.exports = { SocketService };
