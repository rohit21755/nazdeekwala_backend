const express = require("express");
const router = express.Router();
const { isAdminAuth } = require("../middlewares/auth");

const {
  login,
  getProfile,
  updateProfile,
  updateLocation,
  getNearByAdmins,
  getTopAdmins
} = require("../controllers/adminController");
const { topTenSellers, topTenProducts } = require("../controllers/dashAdminCnt");
const orderCnt = require("../controllers/orderController");

router.route("/admin/login").post(login);

router
  .route("/admin/profile")
  .get(isAdminAuth, getProfile)
  .put(isAdminAuth, updateProfile);

router.patch('/admin/update-location', isAdminAuth, updateLocation)

router.get('/admin/nearby', getNearByAdmins)

router.get("/b")

router.get('/admins/top', getTopAdmins)

// router.get('/top-admins', getTopAdmins)
// router.get('/admin/top-ten-sellers', topTenSellers)


router.post("/admin/create-subscription", isAdminAuth, orderCnt.sellerCreateOrder)

router.post("/admin/verify-payment",isAdminAuth, orderCnt.verifySellerPayment)


module.exports = router;
