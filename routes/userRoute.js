const express = require("express");
const router = express.Router();
const { isAuthenticated, isSuperAdmin } = require("../middlewares/auth");
const { isAdminAuth } = require("../middlewares/auth");

const {
  register,
  login,
  logout,
  profile,
  changePassword,
  otpVerification,
  forgotPassword,
  resetPassword,
  resendOTP,
  loginWithMobile,
  loginWithOtp,
  updateLocation,
  updateProfile,
} = require("../controllers/userController");
const { getProfile } = require("../controllers/adminController");
const { fetchAdminProfile } = require("../middlewares/profile");
const { addToWishList, removeFromWishList, followSeller, unFollowSeller, getWishList } = require("../controllers/productController");
router.route("/register").post(register);
router.route("/otp").post(otpVerification);
router.route("/forgotPassword").post(forgotPassword);
router.route("/login").post(login);
router.route("/login/by-otp").post(loginWithMobile);
router.route("/login/verify-otp").post(loginWithOtp);
router.route("/logout").post(logout);
//router.route("/profile").get(isAuthenticated, profile);
router.route("/resend-otp").post(resendOTP);
router.route("/user/change-password").put(isAuthenticated, changePassword);
router.route("/admin/change-password").put(isAdminAuth, changePassword);
router.route("/resetPassword").post(resetPassword);

const getAdminProfile = (isAdminAuth) => (req, res, next) => {
  res.json({ user: req.user });
};

// router.route("/profile").get(isAuthenticated, (req, res, next) => {
//   // res.json({ user: req.user });
//   if (req.user.role === "superAdmin") {
//     res.json({ user: req.user });
//   }else{

//   }
// if (/* Add your logic to check if the user is an admin */) {
//   return getProfile(req, res); // Call getProfile controller for admin users
// } else {
//   return profile(req, res); // Call profile controller for authenticated users
// }
// });

 router.route("/user/profile")
 .get(isAuthenticated)
 .put(isAuthenticated, updateProfile);

router.route("/profile").get(fetchAdminProfile);
router.patch('/user/update-location', isAuthenticated, updateLocation)





router.get('/user/wishlist', isAuthenticated, getWishList)
router.patch('/user/add-to-wishlist/:variantId', isAuthenticated, addToWishList)
router.patch('/user/remove-wishlist/:variantId', isAuthenticated, removeFromWishList)


//----------------------------FOLLOWING SELLER----------------------------//


router.patch('/user/follow/:adminId', isAuthenticated, followSeller)
router.patch('/user/unfollow/:adminId', isAuthenticated, unFollowSeller)


module.exports = router;

