const mongoose = require("mongoose")

const offerSchema= new mongoose.Schema({
     
    title: {type: String, default: ""},

    bgImage: {type: String, default: ""},

    category: {type: String, defaut: ""},

    discount: {type: String, default: "10%"},

    component : {type: String, default: ""}





})