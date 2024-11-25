const Brand = require("../models/brandModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const slugify = require("slugify");
const {mailTo} = require('../utils/sendBrandMail')
//Create Brand Super Admin / Admin
exports.createBrand = catchAsyncError(async (req, res, next) => {
  const { brandName, image } = req.body;
  const profile = req.user || req.admin;
  if (!brandName) return next(new ErrorHandler("Brand Name Is Required", 400));

  const isBrandExist = await Brand.findOne({ brandName, image });

  if (isBrandExist)
    return next(new ErrorHandler(`${brandName} Is Already Exists`));

  const brand = await Brand.create({
    brandName,
    slug: slugify(brandName),
    image,
    createdBy: profile._id,
    image
  });

  res.status(201).json({
    success: true,
    message: "Brand Created Successfully",
    brand,
  });
});

exports.createBrandRequest = catchAsyncError(async (req, res, next) => {
  const { brandName, image } = req.body;
  
  

  await mailTo({body: req.body, admin: req.admin})
  return res.status(200).send({success: true, message: "Sending Mail for Brand Request"})

})

//Get All Brands
exports.getAllBrands = catchAsyncError(async (req, res, next) => {
  const brands = await Brand.find();
  res.status(200).json({ success: true, brands });
});

//Get Brand Details
exports.getBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  if (!brand) return next(new ErrorHandler("Brand Not Found", 400));
  res.status(200).json({ success: true, brand });
});

//Update Brand - Super Admin / Admin Can Update Their Brand Only
exports.updateBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { brandName, image } = req.body;
  const profile = req.user || req.admin;

  if (!brandName) return next(new ErrorHandler("Brand Name Is Required", 400));

  const isBrandExist = await Brand.findById(id);

  if (isBrandExist) {
    if (
      profile.role === "superAdmin" ||
      (isBrandExist.createdBy.equals(profile._id) && profile.canManageBrands)
    ) {
      const isBrandNameExist = await Brand.findOne({ brandName });
      if (isBrandNameExist && !isBrandNameExist._id.equals(id)) {
        return next(new ErrorHandler("Brand Name Is Already Exists", 400));
      }
      const brand = await Brand.findByIdAndUpdate(
        id,
        { brandName, slug: slugify(brandName), image },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        success: true,
        message: "Brand Updated Successfully",
        brand,
      });
    }
    return next(
      new ErrorHandler("You Are Not Allowed To Update This Brand", 422)
    );
  }

  return next(new ErrorHandler("Brand Not Found", 400));
});

//Delete Brand - Super Admin Can Delete Brand
exports.deleteBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const data = req.user || req.admin;
  const isBrandExist = await Brand.findById(id);

  if (isBrandExist) {
    if (
      data.role === "superAdmin" ||
      String(isBrandExist.createdBy) === String(data._id)
    ) {
      const brand = await Brand.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ success: true, message: "Brand Deleted Successfully" });
    }
    return next(new ErrorHandler("You Can Not Delete This Brand", 422));
  }

  return next(new ErrorHandler("Brand Not Found", 400));
});
