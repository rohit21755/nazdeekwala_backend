const mongoose = require('mongoose')


const pageSchema = new mongoose.Schema({

    categoryId: {type: mongoose.Schema.Types.ObjectId},
    title: {type: String},
    image: {type: String},
    slug: {type: String},

     
}, {timestamps: true})

module.exports=mongoose.model('SubCategory', pageSchema)