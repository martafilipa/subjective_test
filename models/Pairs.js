const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pairsSchema = new Schema({
    id: {
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
    ref_A: {
      type: String,
    }, 
    ref_B: {
      type: String,
    }
  });
  
module.exports = mongoose.model("Pairs", pairsSchema);