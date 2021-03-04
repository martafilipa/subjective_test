const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trainSchema = new Schema({
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
    res: {
        type: Number,
    }
  });
  
module.exports = mongoose.model("Trains", trainSchema);