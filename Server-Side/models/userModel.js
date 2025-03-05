const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      // required: true,
    },
    fullName: {
      type: String,
    },
    photo: String,
    fbId: {
      type: String,
      unique: true,
    },
    pages: {
      type: Array,
    },

    accessToken: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
