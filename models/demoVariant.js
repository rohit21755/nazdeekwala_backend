const mongoose = require('mongoose')


const pageSchema = new mongoose.Schema({

   name: String,
   price: Number,
   options: mongoose.Schema.Types.Mixed,
   productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Demo'}

}, {timestamps: true})

module.exports=mongoose.model('VariantDemo', pageSchema)