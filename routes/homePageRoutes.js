const express = require("express");
const router = express.Router();
const {
  isSuperAdmin,
  isAuthenticated,
  isAdminAuth,
} = require("../middlewares/auth");
const catchAsyncError = require("../middlewares/catchAsyncError");

const {
  addBanner,

  homePage,
  addSmallBanner,
  addTopSlider,
  addBigBanner,
  addHeroSlider,
  applicationData,
  addOffersSlider,
  addProductSlider,
  addFooter,
} = require("../controllers/offerSliderController");
const {
  brandsData,
  homeBanners,
  viewAllbrands,
} = require("../config/gobalData");
const {
  addApplicationData,
  updateApplicationData,
} = require("../controllers/applicationController");
const demoModel = require("../models/demoModel");
const {
  addBanners,
  deleteBanners,
  getAllBanners,
  getBannersBy,
  updateBannersBy,
  getBannersToShow,
  getSiteMap,
} = require("../controllers/superAdminController");
//---Global application data----------------//
router.get("/global-data", applicationData);
router.route("/app-data").post(addApplicationData).put(updateApplicationData);

//create a offers on home page
router.route("/offers-section/add-discount-offers").post(addOffersSlider); //  data[{category, discountPercent, bgImage, link},....]

//Add products to a section
router.post("/offers-section/add-products", addProductSlider); //  data[variantId,....]

// router.delete('/offers-section/delete/:sectionId', deleteASection)
// router.post('/offers-section/add-offer/:sectionId', addOffers)
//---------------Banner contents-----------//
router.route("/offers-section/banner").post(addBanner).get(getAllBanners);
//--------------home page main api------------//
router.get("/homepage", homePage);
router.route("/homepage/small-banners").post(addSmallBanner);
router.route("/homepage/big-banners").post(addBigBanner);
router.route("/homepage/top-sliders").post(addTopSlider);
router.route("/homepage/hero-sliders").post(addHeroSlider);
router.route("/homepage/footer").post(addFooter);
router.post("/demo", async (req, res) => {
  let data = await demoModel.create({ ...req.body });
  return res.send({ data });
});

router.get("/get-demo", async (req, res) => {
  let data = await demoModel.find();
  return res.send({ data });
});

//-------------------------Updated apis start here----------------------------------------------//

//---------------------                             ---------------------------------------//

router.get(
  "/home/brands",
  catchAsyncError(async (req, res) => {
    const brands = brandsData;
    res.status(200).send({ success: true, data: brands });
  })
);

router.get(
  "/home/all-brands",
  catchAsyncError(async (req, res) => {
    const brands = viewAllbrands;
    res.status(200).send({ success: true, data: { allbrands: brands } });
  })
);

router.get(
  "/home/banners",
  catchAsyncError(async (req, res) => {
    const brands = homeBanners;
    res.status(200).send({ success: true, data: brands });
  })
);

//----------------//
// router.route("/super/banners")         //whereToShow ------- //homePage , filterPage
// .post(isAdminAuth, isSuperAdmin, addBanners)
// .delete(isAdminAuth, deleteBanners)
// .get(getBannersBy)
// .put(isAdminAuth, updateBannersBy)

router
  .route("/super/banners") //whereToShow ------- //homePage , filterPage
  .post( isSuperAdmin, addBanners)
  // .delete(isAuthenticated, isSuperAdmin, deleteBanners)
  // .get(getBannersBy)
  .get(getAllBanners)
  .put( isSuperAdmin, updateBannersBy);

router.get("/get-banners", getBannersToShow);
router
  .route("/super/banners/:bannerId")
  .delete( isSuperAdmin, deleteBanners);



  router.get("/site-map", getSiteMap)

module.exports = router;
