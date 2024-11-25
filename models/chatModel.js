const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    lastMessage:  {type: String, default: ""},
    unSeenCount: {type: Number, default: 0},
    unSeenCountUser: {type: Number, default: 0},
    unSeenVendor: {type: Number, default: 0},
    seen: {type: Boolean, default: false},
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
