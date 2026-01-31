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
      type: String,
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
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'closed'],
      default: 'active'
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      default: null,
    }
  },
  { timestamps: true }
);

// Virtual fields for frontend compatibility
jobSchema.virtual('jobTitle').get(function() {
  return this.jobName;
});

jobSchema.virtual('companyName').get(function() {
  return this.company;
});

jobSchema.virtual('description').get(function() {
  return this.jobDescription;
});

// Make sure virtuals are included in JSON
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Job", jobSchema);