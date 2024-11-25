const mongoose = require('mongoose')


const pageSchema = new mongoose.Schema({

   name: String,
   brand: String,
   filterKeys: [],
   filterOptions: mongoose.Schema.Types.Mixed
}, {timestamps: true})

module.exports=mongoose.model('Demo', pageSchema)


