const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pairsSchema = new Schema({
    idx: {
      type: Number,
      unique: true, 
      index: true,
    },
    A: {
      type: String,
    },
    B: {
      type: String,
    },
  });
  
module.exports = mongoose.model("Pairs", pairsSchema);