const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testSchema = new Schema({
    id: {
      type: String,
      required: true,
      unique: true, 
      index: true,
    },
    email: {
      type: String, 
      required: true,
      unique: true, 
      index: true,
    },
    order: {
      type: [Number],
    },
    judgments: {
      type: [Number],
    },
    current:{
      type: Number,
    },
    time:{
      type: [Date],
    },
    name:{
      type: String
    },
    gender:{
      type: String
    },
    display:{
      type: Number
    },
    display:{
      type: Number
    },
    age:{
      type: Number
    },
    resolution:{
      type:[Number]
    }, 
  });
  
module.exports = mongoose.model("Sessions", testSchema);