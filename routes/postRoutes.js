const express = require("express");
const { createPost,updatePost,  deletePost, likePost, unLikePost, addComment, getUserFeeds, getPost } = require("../controllers/postController");
const router = express.Router();
const { isAdminAuth, isAuthenticated } = require("../middlewares/auth"); 
const messagesModel = require("../models/messagesModel");

//Post create update routes
router.route('/post')
    .post(isAdminAuth, createPost)
    .put(isAdminAuth, updatePost)
    .delete(isAdminAuth, deletePost);
router.route('/post/:adminId')
    .get(getPost)

//----------  COMMENT POST -----------------//

router.route("/post/comment/:postId")
.post(isAuthenticated, addComment)


//---------------   LIKE POST   -------------------//

router.route("/post/like/:postId")
    .get(isAuthenticated, likePost)
    .delete(isAuthenticated, unLikePost);

//---------------Post feeds------------------------//
router.get('/user/feeds', isAuthenticated, getUserFeeds);
module.exports = router
