const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    receipt: String,
    startDate: Date,
    razorpay_payment_id: String,
    razorpay_order_id: String,
    endDate: Date,
    status: { type: String, default: "pending" },
    isActive: { type: Boolean, default: false},
    duration: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    notes: mongoose.Schema.Types.Mixed,
    transactionId: String,
    adminId: { type: objectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("subScription", paymentSchema);
