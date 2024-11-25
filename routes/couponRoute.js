const express = require("express");
const router = express.Router();
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

const {
  isAuthenticated,
  isSuperAdmin,
  isAdminAuth,
} = require("../middlewares/auth");

const Coupon = require("../models/couponModel");

const getSingleCoupon = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return next(new ErrorHandler("Coupon Not Found", 400));
  }

  res.status(200).json({ success: true, coupon });
});

const getAllCoupons = catchAsyncError(async (req, res, next) => {
  const coupons = await Coupon.find();
  res.status(200).json({ success: true, coupons });
});

const getAdminCoupons = catchAsyncError(async (req, res, next) => {
  const profile = req.admin;

  const coupons = await Coupon.find({ createdBy: profile._id });

  res.status(200).json({ success: true, coupons });
});

const createCoupon = catchAsyncError(async (req, res, next) => {
  const profile = req.user || req.admin;

  const requiredFields = [
    "couponName",
    "couponCode",
    "discountPercent",
    "status",
  ];

  for (field of requiredFields) {
    if (!req.body[field]) {
      return next(new ErrorHandler(`${field} Is Required`, 400));
    }
  }

  const isCouponExists = await Coupon.find({
    $or: [
      { couponName: req.body.couponName },
      { couponCode: req.body.couponCode },
    ],
  });

  if (isCouponExists.length > 0) {
    return next(
      new ErrorHandler(`Coupon Name Or Coupon Code Is Already Exists`, 400)
    );
  }

  const coupon = await Coupon.create({ ...req.body, createdBy: profile._id });

  res.status(200).json({
    success: true,
    message: "Coupon Created Successfully",
  });
});

const updateCoupon = catchAsyncError(async (req, res, next) => {
  const couponId = req.params.id;
  const profile = req.user || req.admin;

  if (req.body["createdBy"])
    return next(new ErrorHandler(`CreatedBy Can Not Update`, 400));

  const { couponName, couponCode, discountPercent, status } = req.body;

  // Check if the provided couponName or couponCode is already in use for another coupon
  const existingCoupon = await Coupon.findOne({
    $and: [
      { _id: { $ne: couponId } },
      { $or: [{ couponName }, { couponCode }] },
    ],
  });

  if (existingCoupon) {
    if (existingCoupon.couponName === couponName)
      return next(new ErrorHandler(`Coupon Name Already Use`, 400));

    if (existingCoupon.couponCode === couponCode)
      return next(new ErrorHandler(`Coupon Code Already Use`, 400));
  }

  const coupon = await Coupon.findById(couponId);

  if (!coupon) return next(new ErrorHandler(`Coupon Not Found`, 400));

  console.log(!coupon.createdBy.equals(profile._id));

  if (!coupon.createdBy.equals(profile._id)) {
    if (profile.role !== "superAdmin") {
      console.log("Check");
      return next(
        new ErrorHandler(`You Are Not Allowed To Update This Coupon`, 403)
      );
    }
  }

  //   Update the coupon
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { couponName, couponCode, discountPercent, status },
    { new: true }
  );

  res
    .status(200)
    .json({ success: true, message: "Coupon Updated Successfully" });
});

const deleteCoupon = catchAsyncError(async (req, res, next) => {
  const couponId = req.params.id;

  const profile = req.user || req.admin;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    return next(new ErrorHandler(`Coupon Not Found`, 400));
  }

  if (!coupon.createdBy.equals(profile._id)) {
    if (profile.role !== "superAdmin") {
      return next(
        new ErrorHandler(`You Are Not Allowed To Delete This Coupon`, 403)
      );
    }
  }

  const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

  res.status(200).json({
    success: true,
    message: "Coupon Deleted Successfully",
    deletedCoupon,
  });
});

// Coupon creation routes
router
  .route("/super/admin/create/coupon")
  .post( isSuperAdmin, createCoupon);

router.route("/admin/create/coupon").post(isAdminAuth, createCoupon);

// Get all coupons
router.route("/admin/coupons").get(isAdminAuth, getAdminCoupons);

router.route("/coupons").get( isSuperAdmin, getAllCoupons);

// Get a specific coupon by ID
router.route("/coupon/:id").get(getSingleCoupon);

// Update and delete routes for super admins
router
  .route("/super/admin/coupon/:id")
  .put( isSuperAdmin, updateCoupon)
  .delete( isSuperAdmin, deleteCoupon);

// Update and delete routes for admins
router
  .route("/admin/coupon/:id")
  .put(isAdminAuth, updateCoupon)
  .delete(isAdminAuth, deleteCoupon);

module.exports = router;
