const mongoose = require('mongoose');
const Application = require('../models/application');
const Job = require('../models/job');

const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'Valid jobId is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Prevent givers from applying to jobs
    if (String(req.user.role).toLowerCase() !== 'seeker') {
      return res.status(403).json({ success: false, message: 'Only job seekers can apply' });
    }

    const seekerProfileId = req.user.profileId || null;

    // If the seeker already has an application, allow re-apply only when withdrawn.
    const existing = await Application.findOne({ job: job._id, seeker: req.user._id });
    if (existing) {
      if (existing.status === 'withdrawn') {
        existing.status = 'applied';
        existing.seekerProfile = seekerProfileId;
        await existing.save();
        return res.status(200).json({ success: true, application: existing, reApplied: true });
      }

      return res.status(409).json({ success: false, message: 'You have already applied to this job' });
    }

    try {
      const application = await Application.create({
        job: job._id,
        seeker: req.user._id,
        seekerProfile: seekerProfileId,
      });

      return res.status(201).json({ success: true, application });
    } catch (err) {
      // Duplicate key = already applied
      if (err && err.code === 11000) {
        return res.status(409).json({ success: false, message: 'You have already applied to this job' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Apply to job error:', error);
    return res.status(500).json({ success: false, message: 'Server error while applying', error: error.message });
  }
};

// seeker: withdraw/unapply
const withdrawApplication = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'Valid jobId is required' });
    }

    const application = await Application.findOne({ job: jobId, seeker: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status === 'hired') {
      return res.status(409).json({ success: false, message: 'Cannot withdraw after being hired' });
    }

    application.status = 'withdrawn';
    await application.save();

    return res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('Withdraw application error:', error);
    return res.status(500).json({ success: false, message: 'Server error while withdrawing', error: error.message });
  }
};

// giver: accept/reject (status update)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ success: false, message: 'Valid applicationId is required' });
    }

    const allowed = new Set(['shortlisted', 'rejected']);
    if (!allowed.has(String(status))) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const job = application.job;
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found for this application' });
    }

    if (job.postedBy && String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only update applicants for your own jobs' });
    }

    if (application.status === 'withdrawn') {
      return res.status(409).json({ success: false, message: 'Cannot update a withdrawn application' });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('Update application status error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating application', error: error.message });
  }
};

const listMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ 
      seeker: req.user._id,
      status: { $ne: 'withdrawn' }
    })
      .sort({ createdAt: -1 })
      .populate('job');

    return res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('List my applications error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching applications', error: error.message });
  }
};

const listApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'Valid jobId is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (String(req.user.role).toLowerCase() !== 'giver') {
      return res.status(403).json({ success: false, message: 'Only job givers can view applicants' });
    }

    // Ownership check
    if (job.postedBy && String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only view applicants for your own jobs' });
    }

    const applications = await Application.find({ job: job._id })
      .sort({ createdAt: -1 })
      .populate('seeker', 'username email role profileCompleted profileId')
      .populate('seekerProfile');

    return res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('List applicants error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching applicants', error: error.message });
  }
};

module.exports = {
  applyToJob,
  listMyApplications,
  listApplicantsForJob,
  withdrawApplication,
  updateApplicationStatus,
};
