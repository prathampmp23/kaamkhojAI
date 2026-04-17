const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // ========== ORIGINAL FIELDS ==========
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
  
  // ========== NEW RECOMMENDATION FIELDS ==========
  cachedRecommendations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  
  recommendationsLastUpdated: {
    type: Date,
    default: null
  },
  
  jobViewMode: {
    type: String,
    enum: ['recommended', 'nearby'],
    default: 'recommended'
  },
  
  profileHash: {
    type: String,
    default: null
  },
  
  // ========== RATING & FEEDBACK FIELDS ==========
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ========== METHODS ==========
userSchema.methods.generateProfileHash = function() {
  const crypto = require('crypto');
  const profileData = {
    job_title: this.job_title || '',
    address: this.address || '',
    shift_time: this.shift_time || '',
    experience: this.experience || 0
  };
  return crypto.createHash('md5').update(JSON.stringify(profileData)).digest('hex');
};

userSchema.methods.hasProfileChanged = function() {
  const currentHash = this.generateProfileHash();
  return this.profileHash !== currentHash;
};

userSchema.methods.updateAverageRating = async function() {
  try {
    // Get all feedbacks for this user from the database
    const Feedback = require('./feedback');
    const feedbacks = await Feedback.find({ ratedUser: this._id });
    
    if (feedbacks && feedbacks.length > 0) {
      const totalRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0);
      this.averageRating = parseFloat((totalRating / feedbacks.length).toFixed(2));
      this.totalRatings = feedbacks.length;
      this.ratings = feedbacks.map(f => f._id);
      console.log(`[User Model] Updated average rating for ${this._id}: ${this.averageRating} (${this.totalRatings} ratings)`);
    } else {
      this.averageRating = 0;
      this.totalRatings = 0;
      this.ratings = [];
    }
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
};

module.exports = mongoose.model("User", userSchema);