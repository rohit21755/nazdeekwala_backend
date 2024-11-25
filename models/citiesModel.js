const mongoose = require('mongoose')


const pageSchema = new mongoose.Schema({

    
    title: {type: String},

    image: {type: String},

    location: {
        type: {type: String, default :"Point"},
        coordinates: {type : Array,  default: [-1, 1]}
      },
    

     
}, {timestamps: true})

module.exports=mongoose.model('Cities', pageSchema)