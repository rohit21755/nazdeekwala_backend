const { application } = require("express");
const catchAsyncError = require("../middlewares/catchAsyncError");
const applicationModel = require("../models/applicationModel");
const citiesModel = require("../models/citiesModel");



exports.addApplicationData = catchAsyncError(async(req, res, next)=>{
    let {meta, contact, socialLinks} = req.body
    await applicationModel.deleteMany()
    let data = await applicationModel.create({meta, contact, socialLinks})
    res.status(201).send({success: true, data})
})

exports.updateApplicationData = catchAsyncError(async(req, res, next)=> {
    let {meta, contact, socialLinks} = req.body
    let data = await applicationModel.updateOne({}, {meta, contact, socialLinks}, {new: true})
    res.status(201).send({success: true, data})
})



//--------------------CITIES-----------------------------//

exports.addCities = catchAsyncError(async(req, res, next)=> {
    let {title, image, lat, lng} = req.body
    let location = {
        coordinates: [lat, lng]
    }
    let data = await citiesModel.create({title, image, location})
    return res.status(201).send({success: true, data})
})

exports.getAllCities = catchAsyncError(async(req, res, next)=> {
    let data = await citiesModel.find()
    return res.status(200).send({success: true, data})

})

