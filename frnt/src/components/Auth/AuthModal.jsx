import React, { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import ForgotPassword from './ForgotPassword';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';
import { toast } from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // If not open, don't render anything
  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Name validation (only for signup)
    if (!isLoginMode) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let result;
      if (isLoginMode) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        toast.success(isLoginMode ? 'Login successful' : 'Registration successful');
        setFormData({
          email: '',
          password: '',
          name: '',
        });
        onSuccess?.();
        onClose();
      } else {
        const errorMessage = result.error || (isLoginMode ? 'Invalid email or password' : 'Registration failed');
        setErrors({ submit: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         (isLoginMode ? 'Invalid email or password' : 'Registration failed');
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal-container" onClick={e => e.stopPropagation()}>
          <ForgotPassword 
            onBack={() => setShowForgotPassword(false)}
            onPasswordReset={() => {
              setShowForgotPassword(false);
              setIsLoginMode(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="auth-modal-left">
          <h1>Welcome Back</h1>
          <p>
            Experience premium car service and repair with our expert team.
            Your satisfaction is our priority. Get started today for quality
            maintenance and repairs.
          </p>
        </div>

        <div className="auth-modal-right">
          <h2>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-subtitle">
            {isLoginMode
              ? 'Sign in to continue to your account'
              : 'Join us today and get started with your car service journey'}
          </p>

          {errors.submit && (
            <div className="error-message">
              <FaExclamationCircle /> {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            {isLoginMode && (
              <div className="forgot-password">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setFormData({
                  email: '',
                  password: '',
                  name: ''
                });
                setErrors({});
              }}
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
