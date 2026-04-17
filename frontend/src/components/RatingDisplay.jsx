import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import './RatingDisplay.css';

const RatingDisplay = ({ userId, minimal = false, refreshTrigger = 0 }) => {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const server = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        
        // Handle both string IDs and objects with _id property
        const userIdString = typeof userId === 'string' ? userId : userId?._id || userId;
        
        if (!userIdString) {
          console.warn('[RatingDisplay] No valid userId provided');
          setRatingData(null);
          setLoading(false);
          return;
        }
        
        console.log(`[RatingDisplay] Fetching rating for userId: ${userIdString}`);
        const response = await fetch(`${server}/api/feedback/rating/${userIdString}`);
        
        console.log(`[RatingDisplay] Response status: ${response.status}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log(`[RatingDisplay] No rating found (404)`);
            setRatingData(null);
            setError('');
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch rating: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[RatingDisplay] Rating data received:`, data);
        setRatingData(data);
        setError('');
      } catch (err) {
        console.error('Error fetching rating:', err);
        setError(err.message);
        setRatingData(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRating();
    }
  }, [userId, server, refreshTrigger]);

  if (loading) {
    if (minimal) {
      return (
        <div className="rating-display-minimal">
          <div className="star-rating-compact">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{color: '#d1d5db', fontSize: '14px'}}>☆</span>
            ))}
            <span className="rating-value">0.0</span>
          </div>
        </div>
      );
    }
    return <div className="rating-display loading">Loading rating...</div>;
  }

  if (error) {
    if (minimal) {
      console.warn('[RatingDisplay] Error in minimal mode, showing fallback');
      return (
        <div className="rating-display-minimal">
          <div className="star-rating-compact">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{color: '#d1d5db', fontSize: '14px'}}>☆</span>
            ))}
            <span className="rating-value">0.0</span>
          </div>
        </div>
      );
    }
    return null; // Silently fail for non-minimal mode
  }

  if (!ratingData || ratingData.totalRatings === 0) {
    // Show empty stars instead of "No ratings yet" text
    if (minimal) {
      return (
        <div className="rating-display-minimal">
          <div className="star-rating-compact">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill="none"
                stroke="#d1d5db"
              />
            ))}
            <span className="rating-value">0.0</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="rating-display">
        <div className="rating-summary">
          <div className="rating-score">
            <div className="big-star">
              <Star size={32} fill="none" stroke="#d1d5db" />
            </div>
            <div className="score-info">
              <p className="average-rating">0.0</p>
              <p className="total-ratings">(No ratings yet)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { averageRating, totalRatings, ratings = [] } = ratingData;

  // If minimal mode, just show the star rating
  if (minimal) {
    return (
      <div className="rating-display-minimal">
        <div className="star-rating-compact">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < Math.round(averageRating) ? '#fbbf24' : 'none'}
              stroke={i < Math.round(averageRating) ? '#f59e0b' : '#d1d5db'}
            />
          ))}
          <span className="rating-value">{parseFloat(averageRating).toFixed(1)}</span>
        </div>
      </div>
    );
  }

  // Calculate rating distribution
  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  ratings.forEach((feedback) => {
    if (feedback.rating) {
      ratingDistribution[feedback.rating]++;
    }
  });

  return (
    <div className="rating-display">
      <div className="rating-summary">
        <div className="rating-score">
          <div className="big-star">
            <Star size={32} fill="#fbbf24" stroke="#f59e0b" />
          </div>
          <div className="score-info">
            <p className="average-rating">{parseFloat(averageRating).toFixed(1)}</p>
            <p className="total-ratings">({totalRatings} rating{totalRatings !== 1 ? 's' : ''})</p>
          </div>
        </div>

        {/* Star breakdown */}
        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="rating-bar-item">
              <span className="star-label">
                {star} <Star size={12} fill="#fbbf24" stroke="#f59e0b" />
              </span>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    width: `${totalRatings > 0 ? (ratingDistribution[star] / totalRatings) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="bar-count">{ratingDistribution[star]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent feedback */}
      {ratings.length > 0 && (
        <div className="recent-feedback">
          <h4>Recent Feedback</h4>
          <div className="feedback-list">
            {ratings.slice(0, 3).map((feedback) => (
              <div key={feedback._id} className="feedback-item">
                <div className="feedback-header">
                  <div className="feedback-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < feedback.rating ? '#fbbf24' : 'none'}
                        stroke={i < feedback.rating ? '#f59e0b' : '#d1d5db'}
                      />
                    ))}
                  </div>
                  <span className="feedback-date">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {feedback.comment && (
                  <p className="feedback-comment">{feedback.comment}</p>
                )}
                {(feedback.workQuality || feedback.punctuality || feedback.communication) && (
                  <div className="feedback-attributes">
                    {feedback.workQuality && (
                      <span className="attribute">
                        <strong>Work:</strong> {feedback.workQuality}
                      </span>
                    )}
                    {feedback.punctuality && (
                      <span className="attribute">
                        <strong>Time:</strong> {feedback.punctuality}
                      </span>
                    )}
                    {feedback.communication && (
                      <span className="attribute">
                        <strong>Talk:</strong> {feedback.communication}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
