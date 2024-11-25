const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {Distance, Latitude, Longitude} = require('../config/gobalData')

const userSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full Name is Required"],
  },
  mobileNumber: {
    type: String,
    required: [true, "Mobile Number is Required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
    minLength: [6, "Password Must Be At Least 8 Characters Long"],
    select: false,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  
  location: {
    type: {type: String, default :"Point"},
    coordinates: {type : Array,  default: [ Latitude, Longitude]}
  },
  role: {
    type: String,  
    enum: ["user", "superAdmin"],
    default: "user",
  },
  address: {type: String},

  following : [{ type: mongoose.Schema.Types.ObjectId, ref: "Admin" }],

  wishList: [{type: mongoose.Schema.Types.ObjectId, ref: 'Variant'}],

  lastPaymentId: {type:mongoose.Schema.Types.ObjectId, ref: "Subscription"},

  isVerified: { type: Boolean, default: false },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
