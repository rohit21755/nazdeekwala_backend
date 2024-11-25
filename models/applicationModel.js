const mongoose = require('mongoose')


const pageSchema = new mongoose.Schema({
     
    meta: {
        description: {type: String, default: ""}, 
        keyword: [{type: String, default: ""}]
    },
    contact:  {type: String, default: ""},

    socialsLinks: {youtube: {type: String, default: ""}, facebook: {type: String, default: ""}, instagram: {type: String, default: ""}, twitter: {type: String, default: ""}}
    
     
}, {timestamps: true})

module.exports=mongoose.model('Application', pageSchema)