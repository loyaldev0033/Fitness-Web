const mongoose = require("mongoose");

const equipmentSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    link: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

module.exports = mongoose.model("Equipment", equipmentSchema);
