const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { uploadArray } = require("../utils/aws");
const bannerModel = require("../models/bannerModel");
const variantModel = require("../models/variantModel");
const brandModel = require("../models/brandModel");
const adminModel = require("../models/adminModel");

//Create Admin
exports.createAdmin = catchAsyncError(async (req, res, next) => {
  const requiredFields = [
    "fullName",
    "businessName",
    "address",
    "gstNumber",
    "businessType",
    "email",
    "mobileNumber",
    "password",
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new ErrorHandler(`${field} Is Required`, 400));
    }
  }

  const isAdminExists = await Admin.findOne({ email: req.body.email });
  if (isAdminExists) {
    return next(new ErrorHandler("Admin Already Exists", 409));
  }

  let shopLogoUrl;
  let avatarUrl;

  // if (req.files && req.files?.length > 0) {
  //   const uploadedLogoUrl = await uploadArray(req.files);
  //   shopLogoUrl = uploadedLogoUrl[0];
  // }

  if (req.files && req.files.length > 0) {
    const uploadedImage = await uploadArray(req.files);

    const shopLogoImage = uploadedImage.find(
      (image) => image.fieldName === "shopLogo"
    );

    shopLogoUrl = shopLogoImage && shopLogoImage?.url;

    const avatarImage = uploadedImage.find(
      (image) => image.fieldName === "avatar"
    );

    avatarUrl = avatarImage && avatarImage?.url;
  }

  const admin = await Admin.create({
    ...req.body,
    avatar: avatarUrl,
    shopLogo: shopLogoUrl,
  });

  res
    .status(201)
    .json({ success: true, message: "Admin Created Successfully" });
});

//Get All Admin
exports.getAllAdmin = catchAsyncError(async (req, res, next) => {
  const admins = await Admin.find().populate("lastPaymentId");
  res.status(200).json({
    success: true,
    admins,
  });
});

//Get Single Admin Details
exports.getAdminDetails = catchAsyncError(async (req, res, next) => {
  const admin = await Admin.findById(req.params.id).populate("lastPaymentId");
  if (!admin) {
    return next(new ErrorHandler("Admin Not Found", 404));
  }
  res.status(200).json({
    success: true,
    admin,
  });
});

//Update Single Admin Details
exports.updateAdminDetails = catchAsyncError(async (req, res, next) => {
  let admin = await Admin.findById(req.params.id);

  if (!admin) {
    return next(new ErrorHandler("Admin Not Found", 404));
  }

  if (req.body.password)
    return next(
      new ErrorHandler("You Don't Have Access To Change Password", 400)
    );

  let shopLogoUrl;
  let avatarUrl;

  if (req.files && req.files.length > 0) {
    const uploadedImage = await uploadArray(req.files);

    const shopLogoImage = uploadedImage.find(
      (image) => image.fieldName === "shopLogo"
    );

    shopLogoUrl = shopLogoImage && shopLogoImage?.url;

    const avatarImage = uploadedImage.find(
      (image) => image.fieldName === "avatar"
    );

    avatarUrl = avatarImage && avatarImage?.url;
  }

  if ((!req.body.avatar || !req.body.shopLogo) && req.files?.length < 1) {
    const updateFields = {};

    if (!req.body.avatar) {
      updateFields.avatar = 1;
    }

    if (!req.body.shopLogo) {
      updateFields.shopLogo = 1;
    }

    await Admin.findOneAndUpdate({ _id: admin._id }, { $unset: updateFields });
  }

  admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { ...req.body, avatar: avatarUrl, shopLogo: shopLogoUrl },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    message: "Admin Updated Successfully",
  });
});

//Delete Admin
exports.deleteAdmin = catchAsyncError(async (req, res, next) => {
  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) {
    return next(new ErrorHandler("Admin Not Found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Admin Deleted",
  });
});

exports.topSellers = catchAsyncError(async (req, res, next) => {
  const currentDate = new Date();
  const fourMonthsAgo = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 4,
    1
  );

  let query = [
    {
      $match: {
        createdAt: { $gte: oneYearAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalsells: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ];

  const orders = await orderModel.aggregate(query);
});

//Create User By Super Admin
exports.createUserBySuperAdmin = catchAsyncError(async (req, res, next) => {
  const requiredFields = ["fullName", "email", "mobileNumber", "password"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new ErrorHandler(`${field} Is Required`, 400));
    }
  }

  const isUserExists = await User.findOne({ email: req.body.email });
  if (isUserExists) {
    return next(new ErrorHandler("User Already Exists", 409));
  }

  let avatarUrl;

  if (req.files && req.files.length > 0) {
    const uploadedLogoUrl = await uploadArray(req.files);
    avatarUrl = uploadedLogoUrl[0];
  }

  const user = await User.create({
    ...req.body,
    avatar: avatarUrl,
  });

  res
    .status(201)
    .json({ success: true, message: "User Created Successfully", user });
});

//Get All Users By Super Admin
exports.getAllUsersBySuperAdmin = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

//Get Single User Details By Super Admin
exports.getUserBySuperAdmin = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//Update User Details By Syper Admin
exports.updateUserDetails = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }

  if (req.body.password)
    return next(
      new ErrorHandler("You Don't Have Access To Change Password", 400)
    );

  let avatarUrl;

  if (req.files && req.files?.length > 0) {
    const uploadedImage = await uploadArray(req.files);
    avatarUrl = uploadedImage[0]?.url;
  }

  if (!req.body.avatar && req.files?.length < 1) {
    user.avatar = undefined;
    await user.save();
  }

  user = await User.findByIdAndUpdate(
    req.params.id,
    { ...req.body, avatar: avatarUrl },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json({
    success: true,
    message: "User Updated Successfully",
  });
});

//Delete User By SuperAdmin
exports.deleteUserBySuperAdmin = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }
  res.status(200).json({
    success: true,
    message: "User Deleted",
  });
});

//For Update Super Admin Own Profile

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const profile = req.user;

  if (req.body.password)
    return next(
      new ErrorHandler("Not Allowed To Change Password In This Route", 400)
    );

  if ("isVerified" in req.body)
    return next(new ErrorHandler("Not Allowed To Update isVerified", 400));

  if (req.body.role)
    return next(new ErrorHandler("Not Allowed To Update Own Role", 400));

  let avatarUrl;

  if (req.files && req.files?.length > 0) {
    const uploadedImage = await uploadArray(req.files);
    avatarUrl = uploadedImage[0]?.url;
  }

  if (!req.body.avatar && req.files?.length < 1) {
    await User.findOneAndUpdate(
      { _id: profile._id },
      { $unset: { ["avatar"]: 1 } },
      { new: true }
    );
  }

  const user = await User.findByIdAndUpdate(
    profile._id,
    { ...req.body, avatar: avatarUrl },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    message: "Profile Updated Successfully",
    user,
  });
});

exports.addBanners = catchAsyncError(async (req, res, next) => {
  const { title, banner, order, link, isVisible, whereToShow } = req.body;

  let data = await bannerModel.create({
    title,
    isVisible,
    banner,
    order,
    link,
    whereToShow,
  });
  return res
    .status(201)
    .send({ success: true, data, message: "Banner created" });
});

exports.getBannersBy = catchAsyncError(async (req, res, next) => {
  let { whereToShow } = req.query;
  let data = await bannerModel.find({ whereToShow });
  res.status(201).send({ success: true, data });
});

exports.updateBannersBy = catchAsyncError(async (req, res, next) => {
  let { bannerId, title, banner, isVisible, order, link, whereToShow } =
    req.body;

  let data = await bannerModel.findByIdAndUpdate(bannerId, {
    title,
    isVisible,
    banner,
    order,
    link,
    whereToShow,
  });

  res.status(201).send({ success: true, data, message: "Banner updated" });
});
exports.getAllBanners = catchAsyncError(async (req, res, next) => {
  let data = await bannerModel.find();
  res.status(200).send({ success: true, data });
});

exports.getBannersToShow = catchAsyncError(async (req, res, next) => {
  let { whereToShow } = req.query;

  let data = await bannerModel.find({
    $or: [{ whereToShow }, { whereToShow: "both" }],
    isVisible: true,
  });
  res.status(200).send({ success: true, data });
});
exports.deleteBanners = catchAsyncError(async (req, res, next) => {
  let { bannerId } = req.params;

  console.log("bannerIDddddsdsdsd", bannerId);

  let data = await bannerModel.findByIdAndDelete(bannerId);
  res.status(200).send({ success: true, data });
});

exports.getSiteMap = catchAsyncError(async (req, res, next) => {
  let data = [
    {
      path: "https://nazdikwala.com/",
      lastUpdated: "2024-02-01T09:01:54.859+00:00",
    },
  ];

  const url = "https://nazdikwala.com";
  let sellers = await adminModel
    .find({ isBlocked: false })
    .select({ fullName: 1, updatedAt: 1 });
  sellers.map((sl) => {
    data.push({ path: `${url}/seller/${sl._id}`, lastUpdated: sl.updatedAt });
  });

  let brands = await brandModel.find().select({ brandName: 1, updatedAt: 1 });
  brands.map((sl) => {
    data.push({ path: `${url}/brand/${sl._id}`, lastUpdated: sl.updatedAt });
  });

  let variants = await variantModel
    .find({ isPublic: true })
    .select({ name: 1, updatedAt: 1 });
  variants.map((sl) => {
    data.push({ path: `${url}/product/${sl._id}`, lastUpdated: sl.updatedAt });
  });

  res.status(200).send({ success: true, data });
});
