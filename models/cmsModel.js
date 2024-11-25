const mongoose = require("mongoose");

const cmsSchema = mongoose.Schema(
  {
    pageTitle: {
      type: String,
      required: [true, "Page Title Is Required"],
    },
    pageContent: {
      type: String,
      required: [true, "Page Content Is Required"],
    },
    featuredImage: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isPublic: {
      type: Boolean,
      enum: [true, false],
      default: true,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Page", cmsSchema);
