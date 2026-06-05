import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI } from '../services/api';
import './MyReviewsPage.css';

function Stars({ rating }) {
  return (
    <div className="star-display">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db', fontSize: 20 }}>★</span>
      ))}
      <span className="rating-num">{rating}</span>
    </div>
  );
}

export default function MyReviewsPage() {
  const { user, role } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    if (role === 'worker' && user?._id) {
      reviewsAPI.getByWorker(user._id)
        .then(r => {
          setReviews(r.data);
          if (r.data.length) {
            setAvg((r.data.reduce((s, x) => s + x.rating, 0) / r.data.length).toFixed(1));
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, role]);

  const dist = [5,4,3,2,1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100) : 0
  }));

  return (
    <div className="reviews-page">
      <div className="container">
        <div className="page-header">
          <h1>My Reviews</h1>
          <p>Feedback from families you've worked with</p>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <>
            {reviews.length > 0 && (
              <div className="reviews-summary card">
                <div className="summary-score">
                  <div className="big-rating">{avg}</div>
                  <Stars rating={Number(avg)} />
                  <p className="reviews-total">{reviews.length} reviews</p>
                </div>
                <div className="rating-dist">
                  {dist.map(d => (
                    <div key={d.star} className="dist-row">
                      <span className="dist-star">{d.star} ★</span>
                      <div className="dist-bar">
                        <div className="dist-fill" style={{ width: `${d.pct}%` }} />
                      </div>
                      <span className="dist-count">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="card empty-state">
                <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
                <h3>No reviews yet</h3>
                <p>Families you work with will leave reviews here</p>
              </div>
            ) : (
              <div className="reviews-list-full">
                {reviews.map(r => (
                  <div key={r._id} className="review-full-card card">
                    <div className="rfc-header">
                      <div className="rfc-avatar">{r.household?.name?.charAt(0)?.toUpperCase()}</div>
                      <div className="rfc-info">
                        <h4>{r.household?.name}</h4>
                        <p className="rfc-date">{new Date(r.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p className="rfc-comment">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
