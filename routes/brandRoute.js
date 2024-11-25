const express = require("express");
const router = express.Router();

const {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  createBrandRequest,
} = require("../controllers/brandController");

const {
  isAuthenticated,
  isSuperAdmin,
  isAdminAuth,
} = require("../middlewares/auth");

// router
//   .route("/brand/super/admin/create")
//   .post(isSuperAdmin, createBrand);

// router.route("/brand/admin/create").post(isAdminAuth, createBrand);

// router.route("/brands").get(getAllBrands);

// router.route("/brand/:id").get(getBrand);

// router
//   .route("/brand/super/admin/:id")
//   .put(isSuperAdmin, updateBrand)
//   .delete(isSuperAdmin, deleteBrand);

// router
//   .route("/brand/admin/:id")
//   .put(isAdminAuth, updateBrand)
//   .delete(isAdminAuth, deleteBrand);

// Brand creation routes
router.post(
  "/super/admin/create/brand",
  isAuthenticated,
  isSuperAdmin,
  createBrand
);
router.post("/admin/create/brand", isAdminAuth, createBrandRequest);
router.post("/super/create/brand", isSuperAdmin, createBrand);

// Get all brands
router.get("/brands", getAllBrands);

// Get a specific brand by ID
router.get("/brand/:id", getBrand);

// Update and delete routes for super admins
router
  .route("/super/admin/brand/:id")
  .put(isSuperAdmin, updateBrand)
  .delete(isSuperAdmin, deleteBrand);

// Update and delete routes for admins
router
  .route("/admin/brand/:id")
  .put(isAdminAuth, updateBrand)
  .delete(isAdminAuth, deleteBrand);

module.exports = router;
