const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    title: { type: String },
    banner: { type: String, default: "" },
    link: { type: String, default: "#" },
    whereToShow: { type: String, default: "" }, //homePage , filterPage
    order: Number,
    isVisible: { type: Boolean, defaut: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banners", pageSchema);
