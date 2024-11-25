const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Otp = require("../models/otpModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/sendToken");
const sendOTP = require("../utils/sendOTP");

//Registration (Create User)
exports.register = catchAsyncError(async (req, res, next) => {
  const { fullName, mobileNumber, password, avatar, email } = req.body;
  if (!fullName || !mobileNumber || !password)
    return next(new ErrorHandler("All Fields Are Required", 400));

  const isUserExists = await User.findOne({ mobileNumber });

  if (isUserExists) return next(new ErrorHandler("User Already Exists", 409));

  const otp = Math.floor(100000 + Math.random() * 900000);
  const saveOtp = await Otp.create({
    phone: mobileNumber,
    code: otp,
    exp: new Date().getTime() + 60 * 1000,
  });

  // send sms to mobile number

  sendOTP(otp, mobileNumber);
  console.log(otp);

  const user = await User.create({
    fullName,
    mobileNumber,
    password,
    avatar,
    email,
  });

  sendToken(res, user, "OTP Sent Successfully", 201);
});

// OTP Verification for Registration
exports.otpVerification = catchAsyncError(async (req, res, next) => {
  const mobileNumber = req.body.mobileNumber;
  const otp = req.body.otp;

  if (!mobileNumber || !otp)
    return next(new ErrorHandler("All Fields Are Required", 400));

  const otpUser = await Otp.findOne({ phone: mobileNumber, code: otp });
  if (!otpUser) return next(new ErrorHandler("Wrong OTP / Resend OTP", 401));

  // exp check
  let currentTime = new Date().getTime();
  let diff = otpUser.exp - currentTime;
  console.log(diff);
  console.log(currentTime);
  console.log(otpUser.exp);

  if (diff < 0) {
    await Otp.findOneAndDelete({ phone: mobileNumber, code: otp });
    res.status(498).json({
      success: false,
      message: "OTP is Expired, Please Resend OTP",
    });
  } else {
    const user = await User.findOneAndUpdate(
      { mobileNumber },
      { isVerified: true },
      { new: true }
    );

    await Otp.findOneAndDelete({ phone: mobileNumber, code: otp });
    sendToken(res, user, "Verified Successful", 200);
  }
});

//Login
exports.login = catchAsyncError(async (req, res, next) => {
  const { mobileNumber, password } = req.body;
  if (!mobileNumber || !password)
    return next(new ErrorHandler("All Fields Are Required", 400));

  const user = await User.findOne({ mobileNumber }).select("+password");

  if (!user)
    return next(new ErrorHandler("Invalid Mobile Number Or Password", 401));

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Invalid Mobile Number Or Password", 401));

  if (user.isVerified == false)
    return next(new ErrorHandler("User Not Verified", 401));

  sendToken(res, user, `Welcome Back, ${user.fullName}`, 200);
});

//login using mobile otp

exports.loginWithMobile = catchAsyncError(async (req, res, next) => {
  let { mobileNumber } = req.body;
  let user = await User.findOne({ mobileNumber });
  if (!user) {
    return next(new ErrorHandler("Invalid Mobile Number"));
  }
  if (user.isVerified == false)
    return next(new ErrorHandler("User Not Verified", 401));

  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(otp);
  const saveOtp = await Otp.create({
    phone: mobileNumber,
    code: otp,
    exp: new Date().getTime() + 60 * 1000,
  });

  // send sms to mobile number
  sendOTP(otp, mobileNumber);

  res.status(200).json({
    success: true,
    message: "OTP Resend Successfully",
  });
});

exports.loginWithOtp = catchAsyncError(async (req, res, next) => {
  let { mobileNumber, otp } = req.body;
  if (!mobileNumber || !otp)
    return next(new ErrorHandler("All Fields Are Required", 400));
  let user = await User.findOne({ mobileNumber });

  const otpUser = await Otp.findOne({ phone: mobileNumber, code: otp });
  if (!otpUser) return next(new ErrorHandler("Wrong OTP / Resend OTP", 401));

  // exp check
  let currentTime = new Date().getTime();
  let diff = otpUser.exp - currentTime;
  console.log(diff);
  console.log(currentTime);
  console.log(otpUser.exp);

  if (diff < 0) {
    await Otp.findOneAndDelete({ phone: mobileNumber, code: otp });
    res.status(498).json({
      success: false,
      message: "OTP is Expired, Please Resend OTP",
    });
  } else {
    sendToken(res, user, `Welcome Back, ${user.fullName}`, 200);
  }
});

//Logout
exports.logout = catchAsyncError(async (req, res, next) => {
  const type = req.query.type || "admin";
  if (type === "user") {
    sendToken(res, null, "Logged Out Successfully", 200);
    return;
  }
  sendToken(res, null, "Logged Out Successfully", 200, type);
});

//Get User Profile
exports.profile = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});
exports.updateLocation = catchAsyncError(async (req, res, next) => {
  const { _id } = req.user;
  let { latitude, longitude, address } = req.body;

  if (!latitude || !longitude) {
    next(new ErrorHandler("Please provide lat and long", 400));
  }

  //let location = {coordinates : [latitude, longitude]}
  const location = {
    type: "Point",
    coordinates: [latitude, longitude],
  };

  let data = await User.findByIdAndUpdate(
    _id,
    { location },
    { new: true }
  ).select("location address");

  return res
    .status(200)
    .send({ success: true, data, message: "Location updation success" });
});

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  let { _id } = req.user;
  let { fullName, address, email, mobileNumber } = req.body;

  let data = await User.findByIdAndUpdate(
    _id,
    { fullName, address, email, mobileNumber },
    { new: true }
  );
  return res.status(200).send({ success: true, data, message: "Updated! ✨" });
});
//Change Password
exports.changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("All Fields Are Required", 400));
  }

  const profile = req.user || req.admin;

  const user = await (req.user ? User : Admin)
    .findById(profile._id)
    .select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 400));

  user.password = newPassword;
  await user.save();

  sendToken(res, null, "Password Changed Login With New Password", 200);
});

//  Resend OTP
exports.resendOTP = catchAsyncError(async (req, res, next) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber)
    return next(new ErrorHandler("Phone Number Required", 400));

  const isUserExists = await User.findOne({ mobileNumber });

  if (!isUserExists) return next(new ErrorHandler("User Does Not Exists", 409));

  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(otp);
  const saveOtp = await Otp.create({
    phone: mobileNumber,
    code: otp,
    exp: new Date().getTime() + 60 * 1000,
  });

  // send sms to mobile number
  sendOTP(otp, mobileNumber);

  res.status(200).json({
    success: true,
    message: "OTP Resend Successfully",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber)
    return next(new ErrorHandler("Mobile Number is Required", 400));

  // Check USER Exist or not
  const user = await User.findOne({ mobileNumber });
  if (!user) return next(new ErrorHandler("User Does Not Exist", 404));

  // Check user verified or not
  if (user.isVerified == false)
    return next(new ErrorHandler("User Not Verified", 401));

  // Create OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(otp);
  const saveOtp = await Otp.create({
    phone: mobileNumber,
    code: otp,
    exp: new Date().getTime() + 60 * 1000,
  });

  // Send OTP
  sendOTP(otp, mobileNumber);

  res.status(200).json({
    success: true,
    message: "OTP sent Successfully",
  });
});

// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { newPassword, mobileNumber, otp } = req.body;
  if (!newPassword || !mobileNumber || !otp) {
    return next(new ErrorHandler("All Fields Are Required", 400));
  }
  // Check USER Exist or not
  const user = await User.findOne({ mobileNumber });
  if (!user) return next(new ErrorHandler("User Does Not Exist", 404));

  // Check user verified or not
  if (user.isVerified == false)
    return next(new ErrorHandler("User Not Verified", 401));

  // Check OTP
  const otpUser = await Otp.findOne({ phone: mobileNumber, code: otp });
  if (!otpUser) return next(new ErrorHandler("Wrong OTP - Resend OTP", 401));

  // OTP Expire Check
  let currentTime = new Date().getTime();
  let diff = otpUser.exp - currentTime;

  if (diff < 0) {
    await Otp.findOneAndDelete({ phone: mobileNumber, code: otp });
    res.status(498).json({
      success: false,
      message: "OTP is Expired, Please Resend OTP",
    });
  } else {
    // Update Password
    user.password = newPassword;
    await user.save();

    // Delete Used OTP
    await Otp.findOneAndDelete({ phone: mobileNumber, code: otp });
    res.status(200).json({
      success: true,
      message: "Password Changed Successfully! Please Login",
    });
  }
});
