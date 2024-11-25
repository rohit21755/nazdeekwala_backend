const reviewCnt = require('../controllers/reviewsController')
const express = require("express")
const {
    isAuthenticated,
    isSuperAdmin,
    isAdminAuth,
  } = require("../middlewares/auth");

const router = express.Router();


router.post('/review/addreview/:productId',isAuthenticated, reviewCnt.addReview)

router.get('/review/product/:productId', reviewCnt.getProductReviews)

router.delete('/review/delete/:reviewId',isAuthenticated, reviewCnt.deleteReview)

router.get('/review/all', isAuthenticated, reviewCnt.getAllReviewsByUser)

module.exports = router;
