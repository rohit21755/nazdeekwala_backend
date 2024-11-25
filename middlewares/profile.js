const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const subScription = require("../models/subScription");
const cartModel = require("../models/cartModel");

const fetchAdminProfile = catchAsyncError(async (req, res, next) => {
  let { nazdikwala, nazdikwalaUser } = req.cookies;
  const { authorization } = req.headers;
  const { type } = req.query;
  if(type=="user"){
    nazdikwala = nazdikwalaUser
  }


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
  //   req.user = await User.findById(decoded._id);
  let user = await User.findById(decoded._id).lean();

  if (user) {
    if (type == "user") {
      req.user = user;
      let cart = await cartModel.find({ userId: req.user._id }).count();
      return res
        .status(200)
        .json({ success: true, user: { ...req.user, cartLength: cart } });
    } else {
      req.user = user;
      console.log("user ", user);
      console.log("req.user ", req.user);
      return res.status(200).json({ success: true, admin: req.user });
    }
  } else {
    let adminData = await Admin.findById(decoded._id).populate("lastPaymentId");
    req.user = adminData;
    if (req.user.isBlocked) {
      return next(new ErrorHandler("This Account is Blocked", 401));
    }
    if (req.user.lastPaymentId && req.user.lastPaymentId.isActive == true) {
      if (
        new Date(Date.now()).getTime() >
        new Date(req.user.lastPaymentId.endDate).getTime()
      ) {
        adminData.lastPaymentId.isActive = false;

        req.user = await adminData.save();
        await subScription.findByIdAndUpdate(adminData.lastPaymentId._id, {
          isActive: false,
        });
      }
    }

    res.status(200).json({ success: true, admin: req.user });
  }

  if (!req.user) return next(new ErrorHandler("Not Logged In", 401));
  next();
});

module.exports = { fetchAdminProfile };
