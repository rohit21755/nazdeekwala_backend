const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    order: { type: Number, default: 0 },
    links: [
      {
        label: { type: String, default: "" },
        link: { type: String, default: "" },
      },
    ],

    content: {type: String, default: ""}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Footer", pageSchema);
