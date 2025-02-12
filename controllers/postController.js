const postModel = require('../models/postModel.js')
const variantModel = require('../models/variantModel.js')
const userModel = require('../models/userModel.js')
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");


exports.createPost = catchAsyncError(async(req, res, next)=> {

    let {_id} = req.admin
    const {variant, content, caption, isPost} = req.body

    let exist = await variantModel.findById(variant)
    if(!variant){
        return next(new ErrorHandler("Variant Id is invalid", 400))
    }

    

    let data = await postModel.create({variant, content, isPost, caption, admin: _id})

    return res.status(201).send({success: true , data})
})

exports.updatePost = catchAsyncError(async(req, res, next)=> {
    let {postId, caption, content, variant} = req.body

    let post = await postModel.findById(postId)
    if(post.admin!==req.admin._id){
        return next(new ErrorHandler("only Owner can update the post", 400))

    }
    if(!post){
        return next(new ErrorHandler("post is invalid", 400))
    }

    post = {...post, caption, images, variant}
    let data = await post.save();
    return res.status(200).send({success: true, data})
})
exports.deletePost = catchAsyncError(async(req, res, next)=> {
    let {postId} = req.query

    let post = await postModel.findByIdAndDelete(postId);

    return next(new ErrorHandler("Post deleted success", 200))
})


//----------------------------------------//


exports.addComment = catchAsyncError(async(req, res, next)=>{
    let {postId} = req.params
    let {_id} = req.user
    let {comment} = req.body
    let newComm = {user: _id, comment}

    let data = await postModel.findByIdAndUpdate(postId, {$push: {comments: newComm}}, {new: true})
    return res.status(201).send({success: true, data})
})


exports.likePost = catchAsyncError(async(req, res, next)=> {
    let {postId} = req.params
    let liked = await postModel.findByIdAndUpdate(postId, {$addToSet: {likes: req.user._id}}, {new: true});
    return res.status(201).send({success: true, data: liked});
})

exports.unLikePost = catchAsyncError(async(req, res, next)=> {
    let {postId} = req.params
    let liked = await postModel.findByIdAndUpdate(postId, {$pull: {likes: req.user._id}}, {new: true});
    return res.status(201).send({success: true, data: liked});
})

exports.getUserFeeds = catchAsyncError(async (req, res, next) => {
    let { _id } = req.user;
    let { page = 1, limit = 10 } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);
 
    // Fetch user and their following list
    const user = await userModel.findById(_id).select("following");
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    const followings = user.following;

    // Fetch all posts as plain objects using .lean()
    const posts = await postModel
        .find()
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
        following: followings.some(followingId => 
            followingId.toString() === post.admin._id.toString()
        )
    }));

    return res.status(200).json({ success: true, posts: postsWithFollowing });
});





