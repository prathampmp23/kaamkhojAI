const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    // Job giver providing the feedback
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    // Worker/Seeker being rated
    ratedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    // Job for which feedback is being given
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    // Application associated with this feedback
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    // Rating from 1 to 5
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Optional comment/review text
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Whether the work was completed satisfactorily
    workQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good',
    },
    // Punctuality rating
    punctuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good',
    },
    // Communication rating
    communication: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good',
    },
  },
  { timestamps: true }
);

// Ensure unique feedback per application
feedbackSchema.index({ application: 1, ratedBy: 1 }, { unique: true });
feedbackSchema.index({ ratedUser: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
