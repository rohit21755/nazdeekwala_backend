const Category = require("../models/categoryModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const slugify = require("slugify");
const subCategoryModel = require("../models/subCategoryModel");
const {  categoryAll,categoryFilters, homePageCategoryList} = require("../config/gobalData");

exports.createCategory = catchAsyncError(async (req, res, next) => {
  const {categoryName, image="" } = req.body;

  const profile = req.user || req.admin;

  if (!categoryName)
    return next(new ErrorHandler("Category Name Is Required", 400));

  const isCategoryExist = await Category.findOne({ categoryName });

  if (isCategoryExist)
    return next(new ErrorHandler(`${categoryName} Is Already Exists`));

  const category = await Category.create({
    categoryName,
    slug: slugify(categoryName),
    image,
    createdBy: profile._id,
  });

  res.status(201).json({
    success: true,
    message: "Category Created Successfully",
    category,
  });
});

exports.getAllCategory = catchAsyncError(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({ success: true, categories });
});

exports.getCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) return next(new ErrorHandler("Category Not Found", 400));
  res.status(200).json({ success: true, category });
});

exports.updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { categoryName, image } = req.body;
  const profile = req.user || req.admin;

  if (!categoryName)
    return next(new ErrorHandler("Category Name Is Required", 400));
  const isCategoryExist = await Category.findById(id);

  if (isCategoryExist) {
    if (
      profile.role === "superAdmin" ||
      (isCategoryExist.createdBy.equals(profile._id) &&
        profile.canManageCategories)
    ) {
      const isCategoryNameExist = await Category.findOne({ categoryName });
      if (isCategoryNameExist && !isCategoryNameExist._id.equals(id)) {
        return next(new ErrorHandler("Category Name Is Already Exists", 400));
      }
      const category = await Category.findByIdAndUpdate(
        id,
        { categoryName, slug: slugify(categoryName), image },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        success: true,
        message: "Category Updated Successfully",
        category,
      });
    }
    return next(
      new ErrorHandler("You Are Not Allowed To Update This Category", 422)
    );
  }

  return next(new ErrorHandler("Category Not Found", 400));
});

exports.deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) return next(new ErrorHandler("Category Not Found", 400));
  res
    .status(200)
    .json({ success: true, message: "Category Deleted Successfully" });
});


//-----------------SUB CATEGORIES----------------//


 exports.addSubCategories = catchAsyncError(async(req, res, next)=>{
  let {categoryId, title, image, slug} = req.body
  let data = await subCategoryModel.create({categoryId, title, image, slug})
  res.status(201).send({success: true, data})
 })

 exports.getAllSubCategoriesByCat = catchAsyncError(async(req, res, next)=>{
  let {categoryId} = req.params
  let data = await subCategoryModel.find({categoryId})
  res.status(200).send({success: true, data})

 })


 //-------Main Categories---------//
 exports.getMainCategories = catchAsyncError(async(req, res, next)=>{
  let data = homePageCategoryList
  res.status(200).send({success: true, data})
 })

//-------Get Subcategories-----------// 
 exports.getCategories = catchAsyncError(async(req, res, next)=> {
  let {mainCategory} = req.query
  let data = categoryAll   //[mainCategory]
  return res.status(200).send({success: true, data})

 })

 exports.getProductFilters = catchAsyncError(async(req, res, next)=> {
  let {subCategory} = req.query
  let data = categoryFilters[subCategory]
  return res.status(200).send({success: true, data})
  

 })

