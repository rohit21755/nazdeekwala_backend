const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat"},
    seen: {type: Boolean, default: false},
    message: { type: String, trim: true },
    from: {type: String, enum: ["user", "admin"]},
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    // variantId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Variant",
    // }, 
  },
  { timestamps: true }
);
module.exports = mongoose.model("Message", messageSchema);