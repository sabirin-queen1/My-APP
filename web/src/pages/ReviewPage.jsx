import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ReviewPage.css';

export default function ReviewPage() {
  const { workerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { alert('Please select a rating'); return; }
    if (!comment.trim()) { alert('Please write a review'); return; }
    setLoading(true);
    try {
      await reviewsAPI.create({ worker: workerId, rating, comment });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="review-page">
      <div className="container">
        <div className="success-card card">
          <div className="success-icon">⭐</div>
          <h2>Review Submitted!</h2>
          <p>Thank you for your feedback. It helps other families make better decisions.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="review-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="review-card card">
          <h1>Rate Your Worker</h1>
          <p className="review-sub">Share your experience to help other families</p>

          <div className="star-rating">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                className={`star-btn ${star <= (hovered || rating) ? 'active' : ''}`}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="rating-label">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          )}

          <div className="form-group">
            <label>Write Your Review</label>
            <textarea
              rows={5}
              placeholder="Fatima is very hardworking and honest. She did a great job in our home. Highly recommended!"
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={300}
            />
            <span className="char-count">{comment.length}/300</span>
          </div>

          <button className="btn btn-primary submit-review" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
