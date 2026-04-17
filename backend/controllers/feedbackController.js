const Feedback = require('../models/feedback');
const User = require('../models/user');
const Application = require('../models/application');
const AuthUser = require('../models/authUser');

// Submit feedback for a worker
exports.submitFeedback = async (req, res) => {
  try {
    const { ratedUserId, jobId, applicationId, rating, comment, workQuality, punctuality, communication } = req.body;
    const ratedById = req.user.id;

    // Validation
    if (!ratedUserId || !jobId || !applicationId || !rating) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if application exists and is in correct status
    const application = await Application.findById(applicationId).populate('job seeker seekerProfile');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the job was posted by the user submitting feedback
    if (!application.job || !application.job.postedBy) {
      return res.status(404).json({ message: 'Job not found or is invalid' });
    }

    if (application.job.postedBy.toString() !== ratedById) {
      return res.status(403).json({ message: 'You can only provide feedback for jobs you posted' });
    }

    // Verify the worker is the one who applied - handle both ObjectId and string
    const seekerId = application.seeker._id || application.seeker;
    if (seekerId.toString() !== ratedUserId) {
      console.error(`Seeker mismatch: DB seeker=${seekerId}, received=${ratedUserId}`);
      return res.status(403).json({ message: 'Worker ID does not match the application' });
    }

    // Check if feedback already exists for this application
    const existingFeedback = await Feedback.findOne({
      application: applicationId,
      ratedBy: ratedById
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already provided feedback for this application' });
    }

    // Create feedback
    const feedback = new Feedback({
      ratedBy: ratedById,
      ratedUser: ratedUserId,
      job: jobId,
      application: applicationId,
      rating,
      comment: comment || '',
      workQuality: workQuality || 'good',
      punctuality: punctuality || 'good',
      communication: communication || 'good'
    });

    await feedback.save();

    // Update user's rating statistics
    console.log(`[Feedback] Updating rating for user profile: ${application.seekerProfile}`);
    const userProfile = await User.findById(application.seekerProfile);
    if (userProfile) {
      await userProfile.updateAverageRating();
      await userProfile.save();
      console.log(`[Feedback] Updated user profile. New average: ${userProfile.averageRating}, Total: ${userProfile.totalRatings}`);
    } else {
      console.warn(`[Feedback] User profile not found: ${application.seekerProfile}`);
    }

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error while submitting feedback' });
  }
};

// Get all feedback for a user (by ratedUser)
exports.getUserFeedbacks = async (req, res) => {
  try {
    const { userId } = req.params;

    const feedbacks = await Feedback.find({ ratedUser: userId })
      .populate('ratedBy', 'email username')
      .populate('job', 'jobName company')
      .sort({ createdAt: -1 });

    // Calculate summary statistics
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(2)
      : 0;

    // Count by rating
    const ratingDistribution = {
      5: feedbacks.filter(f => f.rating === 5).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      1: feedbacks.filter(f => f.rating === 1).length,
    };

    res.status(200).json({
      totalFeedbacks,
      averageRating: parseFloat(averageRating),
      ratingDistribution,
      feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Server error while fetching feedbacks' });
  }
};

// Get feedback for a specific application
exports.getApplicationFeedback = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const feedback = await Feedback.findOne({ application: applicationId })
      .populate('ratedBy', 'email username')
      .populate('ratedUser', 'username');

    if (!feedback) {
      return res.status(404).json({ message: 'No feedback found for this application' });
    }

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
};

// Get user's average rating - calculated fresh from Feedback collection
exports.getUserRating = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[getUserRating] Fetching rating for userId: ${userId}`);

    // Fetch all feedbacks for this user DIRECTLY from Feedback collection
    const feedbacks = await Feedback.find({ ratedUser: userId })
      .populate('ratedBy', 'email username')
      .populate('job', 'jobName company')
      .sort({ createdAt: -1 });

    // If no feedbacks, return 0 rating
    if (!feedbacks || feedbacks.length === 0) {
      console.log(`[getUserRating] No feedbacks found for userId: ${userId}`);
      return res.status(200).json({
        userId: userId,
        averageRating: 0,
        totalRatings: 0,
        ratings: []
      });
    }

    // Calculate average rating fresh from actual feedback data
    const allRatings = feedbacks.map(f => f.rating);
    const totalRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0);
    const averageRating = parseFloat((totalRating / feedbacks.length).toFixed(2));
    
    console.log(`[getUserRating] Calculated average:`, {
      totalFeedbacks: feedbacks.length,
      ratings: allRatings,
      sum: totalRating,
      average: averageRating
    });

    const responseData = {
      userId: userId,
      averageRating: averageRating,
      totalRatings: feedbacks.length,
      ratings: feedbacks
    };
    
    console.log(`[getUserRating] Returning rating data:`, {
      userId: userId,
      averageRating: responseData.averageRating,
      totalRatings: responseData.totalRatings
    });
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ message: 'Server error while fetching user rating' });
  }
};

// Update feedback (only by the one who submitted it)
exports.updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { rating, comment, workQuality, punctuality, communication } = req.body;
    const userId = req.user.id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.ratedBy.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own feedback' });
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      feedback.rating = rating;
    }
    if (comment !== undefined) feedback.comment = comment;
    if (workQuality) feedback.workQuality = workQuality;
    if (punctuality) feedback.punctuality = punctuality;
    if (communication) feedback.communication = communication;

    await feedback.save();

    // Update user's average rating
    const userProfile = await User.findById(feedback.ratedUser);
    if (userProfile) {
      await userProfile.updateAverageRating();
      await userProfile.save();
    }

    res.status(200).json({
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Server error while updating feedback' });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.ratedBy.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own feedback' });
    }

    const ratedUserId = feedback.ratedUser;
    await Feedback.findByIdAndDelete(feedbackId);

    // Update user's average rating
    const userProfile = await User.findById(ratedUserId);
    if (userProfile) {
      await userProfile.updateAverageRating();
      await userProfile.save();
    }

    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Server error while deleting feedback' });
  }
};
