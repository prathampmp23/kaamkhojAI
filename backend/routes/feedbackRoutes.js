const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

// @route   POST /api/feedback/submit
// @desc    Submit feedback for a worker
// @access  Private (Job Giver)
router.post('/submit', auth, feedbackController.submitFeedback);

// @route   GET /api/feedback/user/:userId
// @desc    Get all feedbacks for a user
// @access  Public
router.get('/user/:userId', feedbackController.getUserFeedbacks);

// @route   GET /api/feedback/application/:applicationId
// @desc    Get feedback for a specific application
// @access  Private
router.get('/application/:applicationId', auth, feedbackController.getApplicationFeedback);

// @route   GET /api/feedback/rating/:userId
// @desc    Get user's average rating and rating count
// @access  Public
router.get('/rating/:userId', feedbackController.getUserRating);

// @route   PUT /api/feedback/:feedbackId
// @desc    Update feedback
// @access  Private (Feedback owner)
router.put('/:feedbackId', auth, feedbackController.updateFeedback);

// @route   DELETE /api/feedback/:feedbackId
// @desc    Delete feedback
// @access  Private (Feedback owner)
router.delete('/:feedbackId', auth, feedbackController.deleteFeedback);

module.exports = router;
