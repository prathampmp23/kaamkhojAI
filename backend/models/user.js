const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
  },
  shift_time: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  job_title: {
    type: String,
    required: true,
  },
  salary_expectation: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
