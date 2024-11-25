const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId


const reviewSchema = new mongoose.Schema({
    name : {type: String},

    rating: {type: Number, default: 0}, 

    title: {type: String, default: ""},

    comment: {type: String, default: ""},

    userId: {type: objectId, ref: "User"},

    productId: {type: objectId, ref: "Product"}

},{timestamps: true})

module.exports = mongoose.model('Reviews', reviewSchema)