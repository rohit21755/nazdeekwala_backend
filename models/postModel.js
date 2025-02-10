const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId
const postSchema = mongoose.Schema({
    variant: {type: objectId, ref: 'Variant'},
    admin: {type: objectId, ref: 'Admin'},
    isPost: {type: Boolean, default: true},
    time: {type: Date, default: Date.now()},
    content: [{type: String}],
    caption: {type: String, required: [true, "Caption is required"]},
    likes: [{type: objectId, ref: 'User'}],
    comments: [{user:{type: objectId, ref: 'User'}, comment: String }]
});

 

module.exports = mongoose.model("Post", postSchema);