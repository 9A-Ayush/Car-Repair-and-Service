import React, { useState, useEffect } from 'react';
import './Rating.css';
import { FaStar, FaTimes, FaUser, FaCheck } from 'react-icons/fa';
import { submitRating } from '../../services/ratingService';

const Rating = ({ isOpen, onClose, isAuthenticated, onAuthRequired }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Reset form state when modal opens
    setRating(0);
    setHover(0);
    setFeedback('');
    setError(null);
    setSuccess(false);
    setShowAuthPrompt(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setShowAuthPrompt(!isAuthenticated);
  }, [isOpen, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }
    
    const ratingData = {
      rating: parseInt(rating),
      comment: feedback
    };

    try {
      if (!isAuthenticated) {
        setShowAuthPrompt(true);
        return;
      }

      setSubmitting(true);
      setError(null);
      const response = await submitRating(ratingData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setRating(0);
          setFeedback('');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.response?.status === 401) {
        setShowAuthPrompt(true);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(error.message || 'Failed to submit rating. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthRedirect = () => {
    onClose();
    onAuthRequired();
  };

  if (!isOpen) return null;

  return (
    <div className="rating-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rating-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {showAuthPrompt ? (
          <div className="auth-prompt">
            <FaUser className="auth-icon" />
            <h2>Sign in Required</h2>
            <p>Please sign in or create an account to submit a rating.</p>
            <button className="submit-btn" onClick={handleAuthRedirect}>
              Sign in / Sign up
            </button>
          </div>
        ) : !success ? (
          <>
            <h2>Rate Our Service</h2>
            <p>How would you rate your experience with us?</p>

            <div className="stars-container">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        console.log('Selected rating:', value); // Debug log
                        setRating(value);
                      }}
                      checked={rating === ratingValue}
                    />
                    <FaStar
                      className="star"
                      color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                      size={40}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                );
              })}
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <textarea
                  placeholder="Tell us about your experience (optional)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={rating === 0 || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          </>
        ) : (
          <div className="success-message">
            <FaCheck className="success-icon" />
            <h2>Thank You!</h2>
            <p>Your feedback has been submitted successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rating;
