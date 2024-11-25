const mongoose = require('mongoose')


const pageSchema = new mongoose.Schema({
    componentLabel: {type: String, default: ""},
    dataOf: {type: String, default: ""},
    order: {type: Number, default: 0},
    data: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant'
    }], 
}, {timestamps: true})

module.exports=mongoose.model('homeProductsSlider', pageSchema)