const catchAsyncError = require('../middlewares/catchAsyncError')
const bannerModel = require('../models/bannerModel')
const contentsModel = require('../models/bannerModel')
const categoryModel = require('../models/categoryModel')
const footerModel = require('../models/footerModel')
const homePage = require('../models/offerSliders')
const applicationModel = require("../models/applicationModel");
const homePageProductSlider = require('../models/homePageProductSlider')
const offerSliders = require('../models/offerSliders')

exports.createSection = catchAsyncError(async(req, res, next)=>{
     const { offerSliderTitle,offerProductsTitle, products, offers, order} = req.body
     let exist = await homePage.find({order})
     if(exist){
        await homePage.findOneAndDelete({order})
     }
     const data = await homePage.create({offerSliderTitle,offerProductsTitle,products, offers, order})
     res.status(201).send({success: true, data})
})
exports.getAllSection = catchAsyncError(async(req, res, next)=>{
        let data = await homePage.find().populate('products').sort({'order': 1})
        res.status(200).send({success: true, data})
})
exports.deleteASection = catchAsyncError(async(req, res, next)=>{

    let {sectionId} = req.params
    let data = await homePage.findByIdAndDelete(sectionId)
    res.status(200).send({status: true, data, message: "section Deleted"})
  
})
exports.addProductsSection = catchAsyncError(async(req, res, next)=>{
    let {sectionId} = req.params
    let {products} = req.body
    let all = await homePage.findById(sectionId)
    homePage.products = [...homePage.products, ...products]
    // let data = await homePage.findByIdAndUpdate(sectionId, {$push: })
    await all.save()
    res.status(201).send({status: true, data: all})


})

exports.addOffers = catchAsyncError(async(req, res, next)=>{
    let {sectionId} = req.params
    let {offers} = req.body
    let all = await homePage.findById(sectionId)
    homePage.products = [...homePage.offers, ...offers]
    // let data = await homePage.findByIdAndUpdate(sectionId, {$push: })
    await all.save()
    res.status(201).send({status: true, data: all})

})


//---------------------------sliders new-----------------//

exports.addOffersSlider = catchAsyncError(async(req, res, next)=>{
    let {dataOf, componentLabel, order, data} = req.body  //date[{category, discountPercent, bgImage, link},....]
    await offerSliders.findOneAndDelete({order});
    let slider = await offerSliders.create({dataOf, componentLabel, order, data})
    res.status(201).send({status: true, data: slider})
})

exports.addProductSlider = catchAsyncError(async(req, res, next)=>{
    let {dataOf, componentLabel, order, data} = req.body   //date[variantId,....]
    await homePageProductSlider.findOneAndDelete({order});
    let slider = await homePageProductSlider.create({dataOf, componentLabel, order, data})
    res.status(201).send({status: true, data: slider})
})

//--------------------------------Banner controller-----------------------------------------------//

// exports.addBanner = catchAsyncError(async(req, res, next)=> {
//     let {title, order, type, banner, link} = req.body
//     let data = await contentsModel.find({order})
//     if(data){
//         await contentsModel.findOneAndDelete({order})
//     }
//     let result = await contentsModel.create({title, order, type, banner, link})
//     res.status(201).send({success: true, data: result})
// })

exports.getAllBanners = catchAsyncError(async(req, res, next)=> {
    let data = await contentsModel.find().sort({'order': 1})
    res.status(200).send({success: true, data})
})

exports.addBanner = catchAsyncError(async(req, res, next)=> {
    let {topSlider, heroSlider, smallBanner, bigBanner} = req.body

    let banner = await bannerModel.deleteMany()
    let data = await bannerModel.create({topSlider, heroSlider, smallBanner, bigBanner})
    res.status(201).send({success: true, data})

})

exports.addHeroSlider = catchAsyncError(async(req, res, next)=> {
    let {heroSlider} = req.body
    let data = await bannerModel.findOne()
    data.heroSlider = heroSlider
    let result = await data.save()
    res.status(201).send({success: true, data: result})
    
})

exports.addTopSlider = catchAsyncError(async(req, res, next)=> {
    let {topSlider} = req.body
    let data = await bannerModel.findOne()
    data.topSlider = topSlider
    let result = await data.save()
    res.status(201).send({success: true, data: result})
    
})


exports.addSmallBanner = catchAsyncError(async(req, res, next)=> {
    let {smallBanner} = req.body
    let data = await bannerModel.findOne()
    data.smallBanner = smallBanner
    let result = await data.save()
    res.status(201).send({success: true, data: result})
})
exports.addBigBanner = catchAsyncError(async(req, res, next)=> {
    let {bigBanner} = req.body
    let data = await bannerModel.findOne()
    data.bigBanner = bigBanner
    let result = await data.save()
    res.status(201).send({success: true, data: result})
})
exports.homePage = catchAsyncError(async(req, res, next)=> {
    let seoTags = {}
    let offers = await offerSliders.find().sort({order: 1})
    //let products = await homePageProductSlider.find().populate('data', 'name price images discountPercentage discountPrice').sort({'order': 1})
    let products = await homePageProductSlider.aggregate([
        {$lookup: {
            from: 'variants',
            localField: 'data',
            foreignField: '_id',
            as: 'data',
            pipeline: [
                {
                    $project: {name: 1, price: 1, image: {$arrayElemAt: ["$images", 0]},discountPercentage: 1,discountPrice: 1 }
                }

            ]
        }},
        
    ])
    let banners = await bannerModel.findOne()

    res.status(200).send({success: true, banners, seoTags, offerSliders: offers, productSliders: products})

})

exports.applicationData = catchAsyncError(async(req, res, next)=> {
    let appData = await applicationModel.findOne()
    let navData = await categoryModel.find() 
    let footers = await footerModel.find().sort({order: 1})

    return res.status(200).send({success: true, data: {navData, footerData: footers, appData}})
})

//---------------footerController-------------------//

exports.addFooter = catchAsyncError(async(req, res, next)=> {
    let {title, links, order} = req.body

    let exist = await footerModel.find({order})
    if(exist){
        footerModel.findOneAndDelete({order})
    }
    let data = await footerModel.create({footerTitle, links, order})
    res.status(200).send({success: true, data})

})