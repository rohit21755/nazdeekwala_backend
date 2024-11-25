const catchAsyncError = require("../middlewares/catchAsyncError");
const productModel = require("../models/productModel");
const reviewsModel = require("../models/reviewsModel");
const ErrorHandler = require("../utils/errorHandler");

const reviewCnt = {
  addReview: catchAsyncError(async (req, res, next) => {
    let { productId } = req.params;
    let { _id, name } = req.user;
    let prod = await productModel.findById(productId);

    if (!prod) {
      return next(new ErrorHandler("product Id is invalid", 400));
    }

    let { comment, rating, title } = req.body;

    let total =
      parseFloat(prod.numOfReviews) * parseFloat(prod.rating) + rating;
    let finalRating = parseFloat(total / (prod.numOfReviews + 1));

    let review = await reviewsModel.create({
      userId: _id,
      name,
      title,
      comment,
      rating,
      productId,
    });

    prod.numOfReviews += 1;
    prod.rating = finalRating;
    let rate = await prod.save();
    console.log(rate);

    res
      .status(201)
      .send({ success: true, data: review, message: "Review Added" });
  }),

  getProductReviews: catchAsyncError(async (req, res, next) => {
    let { productId } = req.params;
    let reviews = await reviewsModel.find({ productId });


    if(!reviews.length){
      res.status(200).send({ success: true, data: [], ratings: [], message: "No Reviews Available"});
    }


    let total = await reviewsModel.aggregate([
      { $project: { rating: { $round: ["$rating", 0] } } },
      {
        $group: {
          _id: "$rating",
          totalRatings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          rating: "$_id",
          ratingPercent: {
            $multiply: [{ $divide: ["$totalRatings", +reviews.length] }, 100],
          },
        },
      },
    ]);

    res.status(200).send({ success: true, data: reviews, ratings: total });
  }),

  deleteReview: catchAsyncError(async (req, res, next) => {
    let { reviewId } = req.params;
    let { _id } = req.user;

    let review = await reviewsModel.findById(reviewId).populate("productId");
    if (!review) {
      return next(new ErrorHandler("review id is invalid", 400));
    }
    if (req.user.role !== "superAdmin" && review.userId != _id) {
      return next(
        new ErrorHandler("only owner and super admin can delete the order")
      );
    }

    let total =
      parseFloat(review.productId.numOfReviews) *
        parseFloat(review.productId.rating) -
      review.rating;
    let finalRating = parseFloat(total / (prod.numOfReviews - 1));
    let prod = await productModel.findById(review.productId);

    prod.numOfReviews -= 1;
    prod.rating = finalRating;
    let rate = await prod.save();
    console.log(rate);

    await review.deleteOne();
    res.status(200).send({ success: true, msg: "Review deleted" });
  }),

  getAllReviewsByUser: catchAsyncError(async (req, res, next) => {
    let { _id } = req.user;
    let reviews = await reviewsModel.find({ userId: _id });

    res.status(200).send({ success: true, data: reviews });
  }),
};

module.exports = reviewCnt;
