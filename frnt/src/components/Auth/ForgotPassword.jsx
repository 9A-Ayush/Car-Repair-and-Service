import React, { useState } from 'react';
import { FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';
import './AuthModal.css';

const ForgotPassword = ({ onBack, onPasswordReset }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      setSuccess('Password reset link has been sent to your email');
      setTimeout(() => {
        onPasswordReset();
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-right">
      <button className="back-link" onClick={onBack}>
        <FaArrowLeft /> Back to Login
      </button>

      <h2>Reset Password</h2>
      <p className="auth-subtitle">
        Enter your email address and we'll send you a link to reset your password
      </p>

      {error && (
        <div className="error-message">
          <FaExclamationCircle /> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <FaExclamationCircle /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="Enter your email"
            className={error ? 'error' : ''}
          />
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
