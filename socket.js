const WebSocket = require('ws');
const jwt = require("jsonwebtoken");
const { sendMessage } = require("./controllers/chatController.js");
const messageModel = require("./models/messagesModel");
const chatModel = require("./models/chatModel.js");
const myEmitter = require('./utils/event');

class SocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Store client connections with their IDs
    this.chatRooms = new Map(); // Store chat rooms and their participants
  }

  initSocket() {
    this.wss.on('connection', (ws) => {
      console.log('WebSocket connected');

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (err) {
          this.sendError(ws, err.message);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });

    // Handle events from myEmitter
    myEmitter.on('new order', async (data) => {
      const { chatId } = data;
      this.broadcastToChatRoom(chatId, {
        type: 'received_message',
        data
      });
    });
  }

  async handleMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
      case 'setup':
        await this.handleSetup(ws, payload);
        break;
      case 'join_chat':
        await this.handleJoinChat(ws, payload);
        break;
      case 'send_message':
        await this.handleSendMessage(ws, payload);
        break;
      case 'seen_message':
        await this.handleSeenMessage(ws, payload);
        break;
      case 'leave_chat':
        await this.handleLeaveChat(ws, payload);
        break;
    }
  }

  async handleSetup(ws, { token }) {
    if (!token) {
      this.sendError(ws, 'Token needed');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded._id;
      this.clients.set(decoded._id, ws);
      this.sendSuccess(ws, 'Setup successful');
    } catch (err) {
      this.sendError(ws, 'Invalid token');
    }
  }

  async handleJoinChat(ws, { chatId }) {
    try {
      if (!ws.userId) {
        throw new Error('Not authenticated');
      }

      const chat = await chatModel.findById(chatId);
      if (!chat) {
        throw new Error('Invalid ChatId');
      }

      ws.chatId = chatId;
      
      if (!this.chatRooms.has(chatId)) {
        this.chatRooms.set(chatId, new Set());
      }
      this.chatRooms.get(chatId).add(ws);
      
      this.sendSuccess(ws, 'Joined chat successfully');
    } catch (err) {
      this.sendError(ws, err.message);
    }
  }

  async handleSendMessage(ws, { message }) {
    try {
      if (!ws.userId || !ws.chatId) {
        throw new Error('Not authenticated or not in a chat');
      }

      const msg = await sendMessage({
        _id: ws.userId,
        chatId: ws.chatId,
        message
      });

      this.broadcastToChatRoom(ws.chatId, {
        type: 'received_message',
        data: msg
      });
    } catch (err) {
      this.sendError(ws, err.message);
    }
  }

  async handleSeenMessage(ws, { msgId }) {
    try {
      await messageModel.findByIdAndUpdate(msgId, { seen: true });
      await chatModel.findByIdAndUpdate(ws.chatId, { unSeenCount: 0 });
      
      this.broadcastToChatRoom(ws.chatId, {
        type: 'seen_message',
        data: { msgId }
      }, ws); // Exclude sender
    } catch (err) {
      this.sendError(ws, err.message);
    }
  }

  handleLeaveChat(ws, { chatId }) {
    if (this.chatRooms.has(chatId)) {
      this.chatRooms.get(chatId).delete(ws);
      if (this.chatRooms.get(chatId).size === 0) {
        this.chatRooms.delete(chatId);
      }
    }
    delete ws.chatId;
    this.sendSuccess(ws, 'Left chat successfully');
  }

  handleDisconnect(ws) {
    if (ws.userId) {
      this.clients.delete(ws.userId);
    }
    if (ws.chatId && this.chatRooms.has(ws.chatId)) {
      this.chatRooms.get(ws.chatId).delete(ws);
    }
    console.log('WebSocket disconnected');
  }

  broadcastToChatRoom(chatId, message, excludeWs = null) {
    if (this.chatRooms.has(chatId)) {
      this.chatRooms.get(chatId).forEach(client => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }

  sendError(ws, message) {
    ws.send(JSON.stringify({
      type: 'error',
      message
    }));
  }

  sendSuccess(ws, message) {
    ws.send(JSON.stringify({
      type: 'success',
      message
    }));
  }
}

module.exports = { SocketService };