// models/job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    salary: {
      type: String, // keep as string: "₹15,000 - ₹20,000"
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "driver",
        "cook",
        "cleaner",
        "gardener",
        "plumber",
        "electrician",
        "security",
        "factory",
        "construction",
        "house-help",
        "office-helper",
        "other",
      ],
      required: true,
    },

    minAge: {
      type: Number,
      required: true,
      min: 18,
    },

    availability: {
      type: String,
      enum: ["day", "night", "full-time", "part-time", "weekends", "flexible"],
      required: true,
    },

    skillsRequired: {
      type: [String],
      default: [],
    },

    experience: {
      type: String, // e.g. "2+ years"
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
