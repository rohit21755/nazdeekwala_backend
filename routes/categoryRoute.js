const express = require("express");
const router = express.Router();

const {
  createCategory,
  getAllCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  addSubCategories,
  getAllSubCategoriesByCat,
  getMainCategories,
  getCategories,
  getProductFilters
} = require("../controllers/categoryController");



const {
  isAuthenticated,
  isSuperAdmin,
  isAdminAuth,
} = require("../middlewares/auth");

// Category creation routes
router
  .route("/super/admin/create/category")
  .post(isSuperAdmin, createCategory);

router.route("/admin/create/category").post(isAdminAuth, createCategory);

// Get all categories
//router.route("/categories").get(getAllCategory);

// Update and delete and get routes for super admins
router
  .route("/super/admin/category/:id")
  .get(getCategory)
  .put(isSuperAdmin, updateCategory)
  .delete(isSuperAdmin, deleteCategory);
router.route("/admin/category/:id").put(isAdminAuth, updateCategory);
//--------------Sub category------------//
router.route("/admin/sub-category")
.post(isAdminAuth, isSuperAdmin, addSubCategories)
//.get()
router.route("/admin/sub-category/:categoryId", getAllSubCategoriesByCat)


router.get('/maincategories', getMainCategories)


router.get('/categories', getCategories)
//---mainCategory = req.query

router.get('/category-filters', getProductFilters)



module.exports = router;
