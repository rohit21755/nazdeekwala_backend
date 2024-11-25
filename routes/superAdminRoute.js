const express = require("express");
const router = express.Router();
const { isSuperAdmin, isAuthenticated } = require("../middlewares/auth");

const {
  createAdmin,
  getAllAdmin,
  getAdminDetails,
  updateAdminDetails,
  deleteAdmin,
  createUserBySuperAdmin,
  updateUserDetails,
  deleteUserBySuperAdmin,
  getUserBySuperAdmin,
  getAllUsersBySuperAdmin,
  updateProfile,
} = require("../controllers/superAdminController");
const { superCreateProduct, superCreateProductVariant, superGetAdminProducts } = require("../controllers/productController");
const { getSuperStatics, superLastFourMonthSells, superLastOneMonthOrders, superLastMonthSellsByDay, superLastFourMonthOrders } = require("../controllers/dashAdminCnt");

router
  .route("/super/admin/create/user")
  .post(isSuperAdmin, createUserBySuperAdmin);

router
  .route("/super/admin/user/:id")
  .get(isSuperAdmin, getUserBySuperAdmin)
  .put(isSuperAdmin, updateUserDetails)
  .delete(isSuperAdmin, deleteUserBySuperAdmin);

router
  .route("/super/admin/all-users")
  .get(isSuperAdmin, getAllUsersBySuperAdmin);

router
  .route("/super/admin/create/admin")
  .post(isSuperAdmin, createAdmin);

router
  .route("/super/admin/all-admins")
  .get(isSuperAdmin, getAllAdmin);

router
  .route("/super/admin/profile")
  .put(isSuperAdmin, updateProfile);

router
  .route("/super/admin/:id")
  .get(isSuperAdmin, getAdminDetails)
  .put(isSuperAdmin, updateAdminDetails)
  .delete(isSuperAdmin, deleteAdmin);


//----New apis-----------
  router.route("/super/admin/product")
  .post(isSuperAdmin, superCreateProduct)
 
  router.get("/super/get-products/admin/:adminId", isSuperAdmin, superGetAdminProducts)
  router.get("/super/all-products", isSuperAdmin, superGetAdminProducts)

  router.route("/super/admin/variant")
  .post(isSuperAdmin, superCreateProductVariant)

  //router.get("/super/admin/topproducts")

  //router.get("/super/admin/totalsells")

  router.get("/super-admin/statics", isSuperAdmin, getSuperStatics)
  router.get("/super/admin/sells/four-month",isSuperAdmin, superLastFourMonthSells)
  router.get("/super/admin/order/last-four",isAuthenticated,  isSuperAdmin, superLastFourMonthOrders)

  router.get("/super/admin/order/last-month",  isSuperAdmin, superLastOneMonthOrders)
  router.get("/super/admin/sells/last-month", isSuperAdmin, superLastMonthSellsByDay)

  

module.exports = router;
