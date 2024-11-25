const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

//Check User Is Authenticated Or Not
const isAuthenticated = catchAsyncError(async (req, res, next) => {
  let { nazdikwalaUser } = req.cookies;
  const { authorization } = req.headers;
  console.log("called super");
  const nazdikwala = nazdikwalaUser
  if (!nazdikwala && !authorization)
    return next(new ErrorHandler("Not Logged In", 401));
 
  let token;
  if (nazdikwala) {
    token = nazdikwala;
  } else if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.replace("Bearer ", "");
  }
  if (!token) {
    return next(new ErrorHandler("Not Logged In", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);
  if (!req.user) return next(new ErrorHandler("Not Logged In", 401));
  next();
});

//Check The Role Of The User Is Super Admin Or Not
const isSuperAdmin = catchAsyncError(async (req, res, next) => {

  let { nazdikwala } = req.cookies;
  const { authorization } = req.headers;
  console.log("called super");

  if (!nazdikwala && !authorization)
    return next(new ErrorHandler("Not Logged In", 401));

  let token;
  if (nazdikwala) {
    token = nazdikwala;
  } else if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.replace("Bearer ", "");
  }
  if (!token) {
    return next(new ErrorHandler("Not Logged In", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);
  if (!req.user) return next(new ErrorHandler("Not Logged In", 401));

  if (req.user.role !== "superAdmin")
    return next(
      new ErrorHandler("Your Are Not Allowed To Access This Resource", 403)
    );
  next();
});

//Check Admin Is Authenticated Or Not
const isAdminAuth = catchAsyncError(async (req, res, next) => {
  const { nazdikwala } = req.cookies;
  const { authorization } = req.headers;

  if (!nazdikwala && !authorization)
    return next(new ErrorHandler("Not Logged In", 401));

  let token;
  if (nazdikwala) {
    token = nazdikwala;
  } else if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.replace("Bearer ", "");
  }
  if (!token) {
    return next(new ErrorHandler("Not Logged In", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  let adminData = await Admin.findById(decoded._id).populate("lastPaymentId");
  req.admin = adminData;
  if (!req.admin) return next(new ErrorHandler("Not Logged In", 401));
  if (req.admin.isBlocked) {
    return next(new ErrorHandler("This Account is Blocked", 401));
  }
  if (req.admin.lastPaymentId && req.admin.lastPaymentId.isActive == true) {
    console.log(
      "hello world",
      new Date(Date.now()).getTime() >
        new Date(req.admin.lastPaymentId.endDate).getTime()
    );

    if (
      new Date(Date.now()).getTime() >
      new Date(req.admin.lastPaymentId.endDate).getTime()
    ) {
      adminData.lastPaymentId.isActive = false;
      req.admin = await adminData.save();
      await subScription.findByIdAndUpdate(adminData.lastPaymentId._id,  {isActive: false})
    }
  }
  next();
});

module.exports = { isAuthenticated, isSuperAdmin, isAdminAuth };
