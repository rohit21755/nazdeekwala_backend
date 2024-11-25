const offerModel = require('../models/offersModel.js')
const catchAsyncError = require('../middlewares/catchAsyncError')
const ErrorHandler = require('../utils/errorHandler')


exports.createNewOffer = catchAsyncError(async(req, res, next)=> {

    let {title, bgImage, component, category, discount} = req.body

    let data = await offerModel.create({title, bgImage, component, category, discount})
    return res.status(201).send({success: true, data})


}
)