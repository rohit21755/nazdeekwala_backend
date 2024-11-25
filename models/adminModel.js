const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Distance, Latitude, Longitude } = require("../config/gobalData");

const adminSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name Is Required"],
    },
    businessName: {
      type: String,
      required: [true, "Business Name Is Required"],
    },
    address: {},
    isBlocked: { type: Boolean, default: false },
    gstNumber: {
      type: String,
    },
    businessType: {
      type: String,
      required: [true, "Business Type Is Required"],
    },
    email: {
      type: String,
      required: [true, "Email Is Required"],
      unique: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile Number Is Required"],
    },
    shopLogo: {
      type: String,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
      minLength: [6, "Password Must Be At Least 8 Characters Long"],
      select: false,
    },
    manageCMS: {
      type: Boolean,
      default: false,
    },
    // manageUsers: {
    //   type: Boolean,
    //   default: false,
    // },
    manageCoupons: {
      type: Boolean,
      default: false,
    },
    canSeeCategories: {
      type: Boolean,
      default: true,
    },
    canManageCategories: {
      type: Boolean,
      default: false,
    },
    canSeeBrands: {
      type: Boolean,
      default: true,
    },
    canManageBrands: {
      type: Boolean,
      default: false,
    },
    totalOrders: { type: Number, default: 0 },

    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],

    location: {
      type: { type: String, default: "Point" },
      coordinates: {
        type: Array,
        default: [Number(Latitude), Number(Longitude)],
      },
    },
    currentAdd: { type: String, default: "" },
    storeCity: String,
    lastPaymentId: {
      ref: "subScription",
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function (next) {
  console.log(this.isModified("password"));
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.getJwtToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.index({ location: "2dsphere" }, (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});

module.exports = mongoose.model("Admin", adminSchema);
