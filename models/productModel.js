const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  nameOfProduct: String,
  variants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant", // Reference the Variant schema
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  mainCategory: {
    type: String,
  },
  category: {
    type: String,
  },
  subCategory: {
    type: String,
  },
  // productCategory:  {
  //   type: String
  // },
  tags: [String],

  isPublic: { type: Boolean, default: true },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand", // Reference the Brand schema
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },

  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: Array, default: [-1, 1] },
  },
  //---------new updates------//
  filterKeys: [],
  variantFilterOptions: mongoose.Schema.Types.Mixed,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.index({ location: "2dsphere" }, (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});
productSchema.index({ category: 1, mainCategory: 1, subCategory: 1, tags: 1 });
module.exports = mongoose.model("Product", productSchema);
