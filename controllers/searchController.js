const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const Product = require("../models/productModel");
const configSwagger = require("../config/configSwagger");
// const Brand = require("../models/brand");

exports.searchProducts = catchAsyncError(async (req, res, next) => {
    const { searchText } = req.body;
    console.log(searchText)
    if (!searchText) {
        return next(new ErrorHandler("Search text is required", 400));
    }
    try {
        const products = await Product.find({
            $or: [
                { nameOfProduct: { $regex: searchText, $options: "i" } },
            ],
        }).select("_id nameOfProduct mainCategory")
        return res.status(200).send({ success: true, data: products });
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});