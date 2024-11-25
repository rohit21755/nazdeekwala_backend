const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  phone: { type: String, required: [true, "Phone Number is Required"] },
  code: { type: Number, required: [true, "Code is Required"] },
  exp: { type: Number, required: [true, "Code is Required"] },
});

module.exports = mongoose.model("Otp", otpSchema);
