// routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const Job = require("../models/job");

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
