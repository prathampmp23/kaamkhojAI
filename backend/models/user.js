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

module.exports = mongoose.model("User", userSchema);