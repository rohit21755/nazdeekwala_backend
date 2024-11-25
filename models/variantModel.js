const mongoose = require("mongoose");

const variantSchema = mongoose.Schema({
  name: String,
  price: Number,
  isPublic: { type: Boolean, default: false },
  discountPercentage: {
    type: Number,
    min: [0, "Wrong Min Discount"],
    max: [100, "Wrong Max Discount"],
  },

  discountPrice: { type: Number },
  images: [],
  description: {
    type: String,
    required: [true, "Product Description is Required"],
  },
  stock: Number,
  attributes: {},
  tags: [],
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand", // Reference the Brand schema
  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: Array, default: [-1, 1] },
  },

  //------------new updates--------------//
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Reference the Brand schema
  },
  globalFilterOptions: mongoose.Schema.Types.Mixed,
  options: mongoose.Schema.Types.Mixed,
  slug: { type: String, default: "" },
},  {
  timestamps: true,
});
variantSchema.pre("insertMany", async function (next, docs) {
  docs.forEach((element) => {
    element.discountPrice = Math.round(
      element.price * (1 - element.discountPercentage / 100)
    );
  });
  next();
});

variantSchema.pre("save", async function (next, docs) {
  this.discountPrice = Math.round(
    this.price * (1 - this.discountPercentage / 100)
  );
  console.log("called");
  next();
});

variantSchema.pre("findOneAndUpdate", function (next) {
  const data = this.getUpdate();
  data.discountPrice = Math.round(
    data.price * (1 - data.discountPercentage / 100)
  );
  next();
});

variantSchema.index({ location: "2dsphere" }, (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});

variantSchema.index({ name: 1, globalFilterOptions: 1 });
module.exports = mongoose.model("Variant", variantSchema);
