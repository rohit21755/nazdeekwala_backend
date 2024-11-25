const mongoose = require("mongoose");

const couponSchema = mongoose.Schema(
  {
    couponName: {
      type: String,
      required: [true, "Coupon Name Is Required"],
      unique: [true, "Coupon Name Should Be Unique"],
    },
    couponCode: {
      type: String,
      required: [true, "Coupon Name Is Required"],
      unique: [true, "Coupon Code Should Be Unique"],
    },
    discountPercent: {
      type: Number,
      required: [true, "Discount Percent Is Required"],
      min: [1, "Wrong Min Discount"],
      max: [100, "Wrong Max Discount"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
