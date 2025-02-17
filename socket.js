const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const postModel = require("./models/postModel.js");
const userModel = require("./models/userModel.js");
const { sendMessage } = require("./controllers/chatController.js");
const messageModel = require("./models/messagesModel");
const chatModel = require("./models/chatModel.js");
const myEmitter = require('./utils/event');

class UnifiedSocket {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map();
        this.chatRooms = new Map();
    }

    initSocket() {
        this.wss.on("connection", (ws) => {
            console.log("WebSocket connected");

            ws.on("message", async (message) => {
                try {
                    const data = JSON.parse(message);
                    await this.handleMessage(ws, data);
                } catch (err) {
                    console.error("Invalid message format", err);
                }
            });

            ws.on("close", () => {
                this.handleDisconnect(ws);
            });
        });

        // Event listener for real-time chat notifications
        myEmitter.on("new order", async (data) => {
            const { chatId } = data;
            this.broadcastToChatRoom(chatId, {
                type: "received_message",
                data,
            });
        });
    }

    async handleMessage(ws, data) {
        const { type, payload } = data;

        switch (type) {
            /*** Common Setup ***/
            case "setup":
                this.handleSetup(ws, payload);
                break;

            /*** Post System ***/
            case "getPosts":
                this.sendUserPosts(ws, payload);
                break;
            case "likeDislikePost":
                this.handleLikeDislikePost(ws, payload);
                break;
            case "commentPost":
                this.handleCommentPost(ws, payload);
                break;

            /*** Chat System ***/
            case "join_chat":
                this.handleJoinChat(ws, payload);
                break;
            case "send_message":
                this.handleSendMessage(ws, payload);
                break;
            case "seen_message":
                this.handleSeenMessage(ws, payload);
                break;
            case "leave_chat":
                this.handleLeaveChat(ws, payload);
                break;
           

            default:
                this.sendError(ws, "Invalid request type");
        }
    }

    /*** Authentication ***/
    handleSetup(ws, { token }) {
        if (!token) {
            this.sendError(ws, "Token required");
            return;
        }

        try {
            const decoded = jwt.verify(token, "1234@4321@1234@5986@2323#454");
            ws.userId = decoded._id;
            this.clients.set(decoded._id, ws);
            console.log(ws.userId)
            this.sendSuccess(ws, "Setup successful");

        } catch (err) {
            this.sendError(ws, "Invalid token");
        }
    }

    /*** Post Handling ***/
    async sendUserPosts(ws, { page = 1, limit = 10 }) {
        console.log('from send post',ws.userId)
        if (!ws.userId) {
            this.sendError(ws, "Unauthorized");
            return;
        }

        try {
            const user = await userModel.findById(ws.userId).select("following");
            if (!user) {
                this.sendError(ws, "User not found");
                return;
            }
            const followings = user.following;

            const posts2 = await postModel
                .find()
                .sort({ time: -1 }) 
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("admin", "_id fullName avatar")
                .populate("likes", "fullName")
                .populate("comments.user", "fullName avatar")
                .populate("variant", "name price isPublic discountPercentage discountPrice images")
                .lean();

                const posts= posts2.map(post => ({
                    ...post,
                    comments: post.comments.map(({ _id, ...comment }) => comment), // Remove _id from comments
                    following: followings.some(followingId => 
                        followingId.toString() === post.admin._id.toString()
                    )
                }));
            this.sendMessage(ws, "postFeed", posts);
        } catch (error) {
            console.error(error);
            this.sendError(ws, "Error fetching posts");
        }
    }

    async handleLikeDislikePost(ws, { postId }) {
        if (!ws.userId) {
            this.sendError(ws, "Unauthorized");
            return;
        }
    
        try {
            const post = await postModel.findById(postId);
            if (!post) {
                this.sendError(ws, "Post not found");
                return;
            }
    
            const likeIndex = post.likes.indexOf(ws.userId);
            
            if (likeIndex === -1) {
                // User has not liked the post → Like it
                post.likes.push(ws.userId);
                await post.save();
                this.sendSuccess(ws, "Post liked");
            } else {
                // User has already liked the post → Dislike it
                post.likes.splice(likeIndex, 1);
                await post.save();
                this.sendSuccess(ws, "Post disliked");
            }
    
            // Send only postId and updated likes array
            this.broadcastUpdatedPost({
                postId: post._id,
                likes: post.likes
            });
    
        } catch (err) {
            console.error(err);
            this.sendError(ws, "Error updating like status");
        }
    }
    async handleCommentPost(ws, { postId, commentText }) {
        if (!ws.userId) {
            this.sendError(ws, "Unauthorized");
            return;
        }
    
        if (!commentText || commentText.trim() === "") {
            this.sendError(ws, "Comment cannot be empty");
            return;
        }
    
        try {
            const post = await postModel.findById(postId);
            if (!post) {
                this.sendError(ws, "Post not found");
                return;
            }
    
            const comment = {
                user: ws.userId,
                comment: commentText,
                timestamp: new Date()
            };
    
            post.comments.push(comment);
            await post.save();
    
            this.sendSuccess(ws, "Comment added");
    
            // Broadcast updated comments data
            this.broadcastUpdatedPost({
                postId: post._id,
                comments: post.comments.map(({ _id, user, comment }) => ({
                    user,
                    comment
                }))
            });
    
        } catch (err) {
            console.error(err);
            this.sendError(ws, "Error adding comment");
        }
    }
    
    
    

    /*** Chat Handling ***/
    async handleJoinChat(ws, { chatId }) {
        try {
            if (!ws.userId) {
                throw new Error("Not authenticated");
            }

            const chat = await chatModel.findById(chatId);
            if (!chat) {
                throw new Error("Invalid ChatId");
            }

            ws.chatId = chatId;
            if (!this.chatRooms.has(chatId)) {
                this.chatRooms.set(chatId, new Set());
            }
            this.chatRooms.get(chatId).add(ws);

            this.sendSuccess(ws, "Joined chat successfully");
        } catch (err) {
            this.sendError(ws, err.message);
        }
    }

    async handleSendMessage(ws, { message }) {
        try {
            if (!ws.userId || !ws.chatId) {
                throw new Error("Not authenticated or not in a chat");
            }

            const msg = await sendMessage({
                _id: ws.userId,
                chatId: ws.chatId,
                message,
            });

            this.broadcastToChatRoom(ws.chatId, {
                type: "received_message",
                data: msg,
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

    /*** Utility Methods ***/
    broadcastUpdatedPost(post) {
        this.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                this.sendMessage(ws, "updatedPost", post);
            }
        });
    }

    broadcastToChatRoom(chatId, message, excludeWs = null) {
        if (this.chatRooms.has(chatId)) {
            this.chatRooms.get(chatId).forEach((client) => {
                if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    }

    sendMessage(ws, type, data) {
        ws.send(JSON.stringify({ type, data }));
    }

    sendError(ws, message) {
        this.sendMessage(ws, "error", { message });
    }

    sendSuccess(ws, message) {
        this.sendMessage(ws, "success", { message });
    }

    handleDisconnect(ws) {
        this.clients.delete(ws.userId);
        if (ws.chatId && this.chatRooms.has(ws.chatId)) {
            this.chatRooms.get(ws.chatId).delete(ws);
        }
        console.log("WebSocket disconnected");
    }
}

module.exports = { UnifiedSocket };
