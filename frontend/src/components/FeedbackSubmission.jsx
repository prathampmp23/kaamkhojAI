import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './FeedbackSubmission.css';

const FeedbackSubmission = ({ applicationId, workerId, jobId, workerName, onSubmitSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [workQuality, setWorkQuality] = useState('good');
  const [punctuality, setPunctuality] = useState('good');
  const [communication, setCommunication] = useState('good');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const server = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      const response = await fetch(`${server}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ratedUserId: workerId,
          jobId,
          applicationId,
          rating,
          comment,
          workQuality,
          punctuality,
          communication,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit feedback');

      // Wait for database to fully update and calculate average rating
      console.log('[FeedbackSubmission] Waiting for backend to calculate rating...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmitSuccess();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-submission-overlay">
      <div className="feedback-submission-modal">
        <div className="feedback-header">
          <h2>Rate {workerName}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          {error && <div className="error-message">{error}</div>}

          {/* Star Rating */}
          <div className="form-group">
            <label>Overall Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star size={32} fill={star <= (hoverRating || rating) ? '#fbbf24' : 'none'} />
                </button>
              ))}
            </div>
            <p className="rating-text">
              {rating > 0 && `Rating: ${rating} star${rating !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Work Quality */}
          <div className="form-group">
            <label htmlFor="workQuality">Work Quality</label>
            <select
              id="workQuality"
              value={workQuality}
              onChange={(e) => setWorkQuality(e.target.value)}
            >
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>

          {/* Punctuality */}
          <div className="form-group">
            <label htmlFor="punctuality">Punctuality</label>
            <select
              id="punctuality"
              value={punctuality}
              onChange={(e) => setPunctuality(e.target.value)}
            >
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>

          {/* Communication */}
          <div className="form-group">
            <label htmlFor="communication">Communication</label>
            <select
              id="communication"
              value={communication}
              onChange={(e) => setCommunication(e.target.value)}
            >
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label htmlFor="comment">Comment (Optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your feedback here..."
              rows="4"
              maxLength={500}
            />
            <p className="char-count">{comment.length}/500</p>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !rating}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackSubmission;
