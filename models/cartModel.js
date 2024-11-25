const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const cartSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    qty: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
