const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const jobController = require('../controllers/jobController');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const Application = require('../models/application');


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

// GET /api/jobs/mine - list jobs posted by the current job giver
router.get('/mine', protect, requireRole('giver'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching my jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your jobs',
      error: error.message,
    });
  }
});

// POST /api/jobs - create a new job
router.post("/", protect, requireRole('giver'), async (req, res) => {
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
      status: 'active',
      postedBy: req.user._id,
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

// DELETE /api/jobs/:jobId - delete a job posted by the current giver
router.delete('/:jobId', protect, requireRole('giver'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy && String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own jobs' });
    }

    await Application.deleteMany({ job: job._id });
    await Job.deleteOne({ _id: job._id });

    return res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting job', error: error.message });
  }
});

module.exports = router;