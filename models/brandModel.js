const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
    },
    totalOrders: {type: Number, default: 0},
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    image: String
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Brand", brandSchema);
