import axios from 'axios';
import { authService } from '../services/authService';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',  // Updated to match backend PORT
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'http://localhost:3000'
  },
  withCredentials: true,
  timeout: 15000 // 15 second timeout
});

// Function to check if token needs refresh (30 minutes before expiry)
const shouldRefreshToken = (token) => {
  if (!token) return false;
  try {
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    const base64Url = tokenValue.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    const { exp } = JSON.parse(jsonPayload);
    const now = Math.floor(Date.now() / 1000);
    return now >= (exp - 1800); // Refresh if less than 30 minutes left
  } catch (error) {
    console.error('Error checking token refresh:', error);
    return false;
  }
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, check if it needs refresh
    if (token) {
      if (shouldRefreshToken(token) && !config.url.includes('/refresh-token')) {
        try {
          await authService.refreshSession();
          const newToken = localStorage.getItem('token');
          if (newToken) {
            const tokenValue = newToken.startsWith('Bearer ') ? newToken : `Bearer ${newToken}`;
            config.headers.Authorization = tokenValue;
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      } else {
        // Ensure token has Bearer prefix
        const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = tokenValue;
      }
      console.log('Added token to request:', config.url);
    } else {
      console.log('No token found for request:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);

    // Network or connection error
    if (!error.response) {
      console.error('Network error - no response received');
      return Promise.reject({
        message: 'Connection error. Please check your internet connection and try again.'
      });
    }

    // Handle specific error cases
    switch (error.response.status) {
      case 401:
        // Check if it's a token-related error
        if (error.response.data?.message === 'Invalid or expired token') {
          // Clear stored tokens
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirect to home page
          window.location.href = '/';
          
          return Promise.reject({
            message: 'Your session has expired. Please log in again.'
          });
        }
        
        // For other 401 errors, just return the error
        return Promise.reject({
          message: error.response.data?.message || 'Authentication required.'
        });
      
      case 403:
        return Promise.reject({
          message: error.response.data?.message || 'Access denied. You do not have permission to perform this action.'
        });
      
      case 404:
        return Promise.reject({
          message: error.response.data?.message || 'The requested resource was not found.'
        });
      
      case 500:
        return Promise.reject({
          message: error.response.data?.message || 'Server error. Please try again later.'
        });
      
      default:
        return Promise.reject({
          message: error.response.data?.message || 'An unexpected error occurred. Please try again.'
        });
    }
  }
);

export default axiosInstance;
