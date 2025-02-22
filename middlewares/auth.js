const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

//Check User Is Authenticated Or Not
const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { authorization } = req.headers;
  console.log("called super");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new ErrorHandler("Not Logged In", 401));
  }

  const token = authorization.replace("Bearer ", "");
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
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new ErrorHandler("Not Logged In", 401));
  }

  // Extract token from Authorization header
  const token = authorization.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let adminData = await Admin.findById(decoded._id).populate("lastPaymentId");

    if (!adminData) return next(new ErrorHandler("Not Logged In", 401));
    if (adminData.isBlocked) {
      return next(new ErrorHandler("This Account is Blocked", 401));
    }

    if (adminData.lastPaymentId && adminData.lastPaymentId.isActive) {
      const isExpired =
        new Date(Date.now()).getTime() >
        new Date(adminData.lastPaymentId.endDate).getTime();

      if (isExpired) {
        adminData.lastPaymentId.isActive = false;
        await subScription.findByIdAndUpdate(adminData.lastPaymentId._id, {
          isActive: false,
        });
        adminData = await adminData.save();
      }
    }

    req.admin = adminData;
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid Token", 401));
  }
});

module.exports = { isAuthenticated, isSuperAdmin, isAdminAuth };
