const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const applicationController = require('../controllers/applicationController');

// seeker: apply
router.post('/', protect, requireRole('seeker'), applicationController.applyToJob);

// seeker: withdraw/unapply
router.patch('/job/:jobId/withdraw', protect, requireRole('seeker'), applicationController.withdrawApplication);

// seeker: list my applications
router.get('/mine', protect, requireRole('seeker'), applicationController.listMyApplications);

// giver: list applicants for a job
router.get('/job/:jobId', protect, requireRole('giver'), applicationController.listApplicantsForJob);

// giver: accept/reject
router.patch('/:applicationId/status', protect, requireRole('giver'), applicationController.updateApplicationStatus);

module.exports = router;
