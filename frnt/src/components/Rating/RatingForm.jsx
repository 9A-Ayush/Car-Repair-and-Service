import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentById } from '../../services/appointmentService';
import { submitRating } from '../../services/ratingService';
import './Rating.css';

const RatingForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAppointmentById(appointmentId);

      if (result.success) {
        setAppointment(result.data.appointment);
      } else {
        setError(result.error || 'Failed to fetch appointment details');
      }
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);
      setSuccess('');

      const result = await submitRating({
        appointmentId,
        rating,
        review,
      });

      if (result.success) {
        setSuccess('Thank you for your feedback!');
        setTimeout(() => {
          navigate('/my-account');
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit rating. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rating-container">
        <div className="rating-loading">
          <div className="loading-spinner"></div>
          <p>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="rating-container">
        <div className="rating-error">
          <h3>Appointment Not Found</h3>
          <p>We couldn't find the appointment you're looking for.</p>
          <button className="back-button" onClick={() => navigate('/my-account')}>
            Back to My Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-container">
      <h2>Rate Your Service</h2>

      {error && (
        <div className="rating-error-message">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="rating-success-message">
          <p>{success}</p>
        </div>
      )}

      <div className="service-details">
        <p>
          <strong>Service:</strong> {appointment.service}
        </p>
        <p>
          <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
        </p>
        <p>
          <strong>Time:</strong> {appointment.time}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rating-form">
        <div className="star-rating">
          <p>How would you rate our service?</p>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoveredStar || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
              >
                ★
              </span>
            ))}
          </div>
          <p className="rating-text">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        </div>

        <div className="review-input">
          <label htmlFor="review">Your Review (Optional)</label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us about your experience..."
            rows="4"
            maxLength="500"
          />
          <small className="char-count">{review.length}/500 characters</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-rating" disabled={submitLoading}>
            {submitLoading ? 'Submitting...' : 'Submit Rating'}
          </button>
          <button
            type="button"
            className="cancel-rating"
            onClick={() => navigate('/my-account')}
            disabled={submitLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;
