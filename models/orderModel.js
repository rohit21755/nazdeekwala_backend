const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    orderId: { type: String },

    fullName: { type: String, trim: true },

    // mobile : {type: String, required: true},

    status: {
      type: String,
      enum: ["accepted", "pending", "completed", "cancelled"],
      default: "pending",
    },

    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    amount: { type: Number, required: true },

    address: { type: String },

    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },

    email: String,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: "648a9b8269a39ac8436e1715",
    },

    qty: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
