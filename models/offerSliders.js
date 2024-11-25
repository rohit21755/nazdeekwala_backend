const mongoose = require('mongoose')


const pageSchema = new mongoose.Schema({
    componentLabel: {type: String, default: ""},
    dataOf: {type: String, default: ""},
    order: {type: Number, default: 0},
    data: [{
        category: {type: String, default: ""},
        discountPercent: {type: Number, default: 0},
        bgImage: {type: String, default: ""},
        link : {type: String, default: ""},
    }], 
}, {timestamps: true})

module.exports=mongoose.model('OfferSlider', pageSchema)