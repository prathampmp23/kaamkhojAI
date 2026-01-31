const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const jobController = require('../controllers/jobController');
const protect = require('../middleware/auth');


// Public route - for non-logged-in users
router.get('/public', jobController.getPublicJobs);

// Protected routes - for logged-in workers
console.log("protect:", protect);
router.get('/recommended', protect, jobController.getRecommendedJobs);
router.get('/nearby', protect, jobController.getNearbyJobs);
router.post('/toggle-mode', protect, jobController.toggleJobViewMode);
router.post('/invalidate-recommendations', protect, jobController.invalidateRecommendations);

// GET /api/jobs - list all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching jobs",
      error: error.message,
    });
  }
});

// POST /api/jobs - create a new job
router.post("/", async (req, res) => {
  try {
    const {
      jobName,
      company,
      jobDescription,
      location,
      salary,
      category,
      minAge,
      availability,
      skillsRequired,
      experience,
    } = req.body;

    // Basic validation
    if (
      !jobName ||
      !company ||
      !jobDescription ||
      !location ||
      !salary ||
      !category ||
      !minAge ||
      !availability ||
      !experience
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required job fields.",
      });
    }

    const job = new Job({
      jobName,
      company,
      jobDescription,
      location,
      salary,
      category,
      minAge,
      availability,
      skillsRequired: Array.isArray(skillsRequired)
        ? skillsRequired
        : typeof skillsRequired === "string"
        ? skillsRequired.split(",").map((s) => s.trim())
        : [],
      experience,
      status: 'active'
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating job",
      error: error.message,
    });
  }
});

module.exports = router;