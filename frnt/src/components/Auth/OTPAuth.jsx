import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const OTPAuth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [identifier, setIdentifier] = useState('');
  const [type, setType] = useState('email');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/request-otp`, {
        identifier,
        type
      });
      setStep('verify');
    } catch (error) {
      setError(error.response?.data?.message || 'Error requesting OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/verify-otp`, {
        identifier,
        otp
      });

      // Store the token
      localStorage.setItem('token', response.data.token);
      
      // Redirect to dashboard or home
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{step === 'request' ? 'Request OTP' : 'Verify OTP'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {step === 'request' ? (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label>Authentication Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="form-control"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>{type === 'email' ? 'Email Address' : 'Phone Number'}</label>
              <input
                type={type === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={type === 'email' ? 'Enter your email' : 'Enter your phone number'}
                className="form-control"
                required
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="form-control"
                maxLength="6"
                required
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button
              type="button"
              className="link-btn"
              onClick={() => setStep('request')}
            >
              Request New OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OTPAuth;
