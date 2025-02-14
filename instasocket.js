const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const postModel = require('./models/post'); // Adjust path as needed
const userModel = require('./models/user'); // Adjust path as needed

class InstaSocket {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map();
    }

    initSocket() {
        this.wss.on('connection', (ws) => {
            console.log('WebSocket connected');

            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    await this.handleMessage(ws, data);
                } catch (err) {
                    console.error("Invalid message format", err);
                }
            });

            ws.on('close', () => {
                this.handleDisconnect(ws);
            });
        });
    }

    async handleMessage(ws, data) {
        const { type, payload } = data;

        switch (type) {
            case 'setup':
                this.handleSetupPost(ws, payload);
                break;
            case 'getPosts':
                this.sendUserPosts(ws, payload);
                break;
            case 'likePost':
                this.handleLikePost(ws, payload);
                break;
            case 'dislikePost':
                this.handleDislikePost(ws, payload);
                break;
            case 'commentPost':
                this.handleCommentPost(ws, payload);
                break;
            default:
                this.sendError(ws, 'Invalid request type');
        }
    }

    handleSetupPost(ws, { token }) {
        if (!token) {
            this.sendError(ws, 'Token required');
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

    async sendUserPosts(ws, { page = 1, limit = 10 }) {
        if (!ws.userId) {
            this.sendError(ws, 'Unauthorized');
            return;
        }

        try {
            page = parseInt(page);
            limit = parseInt(limit);

           
            const user = await userModel.findById(ws.userId).select("following");
            if (!user) {
                this.sendError(ws, "User not found");
                return;
            }

            const followings = user.following;

          
            const posts = await postModel.find()
                .sort({ time: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("admin", "_id fullName avatar")
                .populate("likes", "fullName")
                .populate("comments.user", "fullName avatar")
                .populate("variant", "name price isPublic discountPercentage discountPrice images")
                .lean();

            
            const postsWithFollowing = posts.map(post => ({
                ...post,
                comments: post.comments.map(({ _id, ...comment }) => comment), // Remove _id from comments
                following: followings.some(followingId => followingId.toString() === post.admin._id.toString())
            }));

            this.sendMessage(ws, 'postFeed', postsWithFollowing);
        } catch (error) {
            console.error(error);
            this.sendError(ws, 'Error fetching posts');
        }
    }

    async handleLikePost(ws, { postId }) {
        if (!ws.userId) {
            this.sendError(ws, 'Unauthorized');
            return;
        }

        try {
            const post = await postModel.findById(postId);
            if (!post) {
                this.sendError(ws, 'Post not found');
                return;
            }

            if (!post.likes.includes(ws.userId)) {
                post.likes.push(ws.userId);
                await post.save();

                this.broadcastUpdatedPost(post);
                this.sendSuccess(ws, 'Post liked');
            } else {
                this.sendError(ws, 'Post already liked');
            }
        } catch (err) {
            console.error(err);
            this.sendError(ws, 'Error liking post');
        }
    }

    async handleDislikePost(ws, { postId }) {
        if (!ws.userId) {
            this.sendError(ws, 'Unauthorized');
            return;
        }

        try {
            const post = await postModel.findById(postId);
            if (!post) {
                this.sendError(ws, 'Post not found');
                return;
            }
            const likeIndex = post.likes.indexOf(ws.userId);
            if (likeIndex > -1) {
                post.likes.splice(likeIndex, 1);
                await post.save();

                this.broadcastUpdatedPost(post);
                this.sendSuccess(ws, 'Post disliked');
            } else {
                this.sendError(ws, 'Post not liked');
            }
        } catch (err) {
            console.error(err);
            this.sendError(ws, 'Error disliking post');
        }
    }

    async handleCommentPost(ws, { postId, commentText }) {
        if (!ws.userId) {
            this.sendError(ws, 'Unauthorized');
            return;
        }

        try {
            const post = await postModel.findById(postId);
            if (!post) {
                this.sendError(ws, 'Post not found');
                return;
            }

            const comment = {
                user: ws.userId,
                comment: commentText
            };

            post.comments.push(comment);
            await post.save();

            this.broadcastUpdatedPost(post);
            this.sendSuccess(ws, 'Comment added');
        } catch (err) {
            console.error(err);
            this.sendError(ws, 'Error adding comment');
        }
    }

    broadcastUpdatedPost(post) {
        this.clients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                this.sendMessage(ws, 'updatedPost', post);
            }
        });
    }

    sendMessage(ws, type, data) {
        ws.send(JSON.stringify({ type, data }));
    }

    sendError(ws, message) {
        this.sendMessage(ws, 'error', { message });
    }

    sendSuccess(ws, message) {
        this.sendMessage(ws, 'success', { message });
    }

    handleDisconnect(ws) {
        this.clients.forEach((clientWs, userId) => {
            if (clientWs === ws) {
                this.clients.delete(userId);
            }
        });
        console.log('WebSocket disconnected');
    }
}

module.exports = InstaSocket;
