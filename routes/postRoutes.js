const express = require("express");
const { createPost,updatePost,  deletePost, likePost, unLikePost } = require("../controllers/postController");
const router = express.Router();
const { isAdminAuth, isAuthenticated } = require("../middlewares/auth"); 

//Post create update routes
router.route('/post')
.post(isAdminAuth, createPost)
.put(isAdminAuth, updatePost)
.delete(isAdminAuth, deletePost)


//----------  COMMENT POST -----------------//

router.route("post/comment")
.post(isAuthenticated)


//---------------   LIKE POST   -------------------//

router.route("/post/like/:postId")
.get(isAuthenticated, likePost)
.delete(isAuthenticated, unLikePost)

//---------------Post feeds------------------------//
router.get('/user/feeds')
