const express = require("express");
const router = express.Router();
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { uploadArray } = require("../utils/aws");

const {
  isAuthenticated,
  isSuperAdmin,
  isAdminAuth,
} = require("../middlewares/auth");

const Page = require("../models/cmsModel");

const createPage = catchAsyncError(async (req, res, next) => {
  const profile = req.user || req.admin;

  const { pageTitle, pageContent, isPublic } = req.body;

  if (!pageTitle || !pageContent || !isPublic) {
    return next(new ErrorHandler("All Fields Are Required", 400));
  }

  let featuredImage = undefined;

  if (req.files && req.files.length > 0) {
    const uploadedImage = await uploadArray(req.files);
    featuredImage = uploadedImage[0]?.url;
  }

  const page = await Page.create({
    pageTitle,
    pageContent,
    isPublic,
    createdBy: profile._id,
    featuredImage,
  });

  res.status(200).json({
    success: true,
    message: "Page Created Successfully",
    page,
  });
});

const updatePage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const profile = req.user || req.admin;
  const { pageTitle, pageContent, isPublic, featuredImage } = req.body;

  const page = await Page.findById(id);

  if (!page) {
    return res.status(400).json({ success: false, message: "Page Not Found" });
  }

  if (!page.createdBy.equals(profile._id)) {
    if (profile.role !== "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "You Are Not Allowed To Update This Page",
      });
    }
  }

  let featuredImageUrl;

  if (req.files && req.files.length > 0) {
    const uploadedImage = await uploadArray(req.files);
    featuredImageUrl = uploadedImage[0]?.url;
  }

  console.log(
    "featuredImage condition",
    (featuredImage === undefined || featuredImage === null) &&
      req.files.length < 1
  );

  if (!featuredImage && req.files.length < 1) {
    page.featuredImage = undefined;
    await page.save();
  }

  const updatedPage = await Page.findByIdAndUpdate(
    id,
    { pageTitle, pageContent, isPublic, featuredImage: featuredImageUrl },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Page Updated Successfully",
    updatedPage,
  });
});

const deletePage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const profile = req.user || req.admin;

  const page = await Page.findById(id);

  if (!page) {
    return res.status(400).json({ success: false, message: "Page Not Found" });
  }

  if (!page.createdBy.equals(profile._id)) {
    if (profile.role !== "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "You Are Not Allowed To Update This Page",
      });
    }
  }

  const deltedPage = await Page.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Page Deleted Successfully",
  });
});

const getAdminPages = catchAsyncError(async (req, res, next) => {
  const profile = req.admin;
  const pages = await Page.find({ createdBy: profile._id });
  // return next(new ErrorHandler("Failed To Fetch All Pages", 400));
  res.status(200).json({ success: true, pages });
});

const getAllPages = catchAsyncError(async (req, res, next) => {
  const pages = await Page.find();
  res.status(200).json({ success: true, pages });
});

const getSinglePage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const page = await Page.findById(id);
  if (!page) {
    return next(new ErrorHandler("Page Not Found", 400));
  }
  res.status(200).json({ success: true, page });
});

router
  .route("/super/admin/create/page")
  .post(isSuperAdmin, createPage);

router
  .route("/super/admin/page/:id")
  .put(isSuperAdmin, updatePage)
  .delete(isSuperAdmin, deletePage);

router.route("/admin/create/page").post(isAdminAuth, createPage);

router.route("/pages").get(isSuperAdmin, getAllPages);

router.route("/admin/pages").get(isAdminAuth, getAdminPages);

router.route("/page/:id").get(getSinglePage);

router
  .route("/admin/page/:id")
  .put(isAdminAuth, updatePage)
  .delete(isAdminAuth, deletePage);

module.exports = router;
