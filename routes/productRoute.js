const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  myProduct,
  productFilters,
  searchProduct,
  uploadVariantImages,
  getFilterProducts,
  getVariant,
  getAllFiterDetails,
  getNearByProducts,
  getNearBySameProducts,
  superUpdateProductVariant,
  superDeleteProductVariant,
} = require("../controllers/productController");
const {
  isAdminAuth,
  isSuperAdmin,
  isAuthenticated,
} = require("../middlewares/auth");
const { topTenProducts } = require("../controllers/dashAdminCnt");
const router = express.Router();
router.route("/product/create").post(isAdminAuth, createProduct);
router.route("/products").get(getAllProducts);
router.route("/products/myProduct").get(isAdminAuth, myProduct);

router
  .route("/product/:id")
  .get(getProductDetails)
  .put(isAdminAuth, updateProduct)
  .delete(isAdminAuth, deleteProduct);

router
  .route("/super/product/:id")
  .put(isSuperAdmin, updateProduct)
  .delete(isSuperAdmin, deleteProduct);

router
  .route("/product/variant/create/:productId")
  .post(isAdminAuth, createProductVariant);

router
  .route("/product/variant/:id")
  .put(isAdminAuth, updateProductVariant)
  .delete(isAdminAuth, deleteProductVariant);

router
  .route("/super/product/variant/:id")
  .put(isSuperAdmin, superUpdateProductVariant)
  .delete(isSuperAdmin, superDeleteProductVariant);

//router.route("/products/filters").get(productFilters);
router.route("/products/get-filters").get(productFilters);
router.route("/products/filter-details").get(getAllFiterDetails);

router.route("/product/search/:keyword").get(searchProduct);
router.route("/upload-variant-images").post(uploadVariantImages);
router.route("/user/get-products").post(uploadVariantImages);
router.route("/product/variant/:slug").get(getVariant);

router.get("/products/nearby", getNearByProducts);

router.get("/products/similar", getNearBySameProducts);

router.get("/products/top-ten-products", topTenProducts);

module.exports = router;
