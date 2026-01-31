const Job = require('../models/job');

const requireJobOwnership = () => {
  return async (req, res, next) => {
    try {
      const jobId = req.params.jobId || req.body.jobId;
      if (!jobId) {
        return res.status(400).json({ success: false, message: 'jobId is required' });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      if (job.postedBy && String(job.postedBy) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Not allowed for this job' });
      }

      req.job = job;
      next();
    } catch (error) {
      console.error('requireJobOwnership error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };
};

module.exports = requireJobOwnership;
