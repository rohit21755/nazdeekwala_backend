const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    image: {type: String},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Category", categorySchema);
