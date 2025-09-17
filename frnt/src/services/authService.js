import axios from 'axios';
import { AUTH_API_URL } from '../config';

// Create axios instance with default config
const authAxios = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 second timeout
});

// Add token to requests if available
authAxios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Error in auth request interceptor:', error);
    return Promise.reject(error);
  }
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

const formatErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || 'An error occurred';
};

const handleAuthResponse = async (response) => {
  try {
    const { token, user } = response.data;
    
    // Store auth data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      user,
      token
    };
  } catch (error) {
    console.error('Error handling auth response:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await authAxios.post('/login', { email, password });
    return handleAuthResponse(response);
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Register user
export const register = async (name, email, password) => {
  try {
    const response = await authAxios.post('/register', { name, email, password });
    return handleAuthResponse(response);
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Validate token
export const validateToken = async () => {
  try {
    const response = await authAxios.get('/validate');
    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Get user profile
export const getProfile = async () => {
  try {
    const response = await authAxios.get('/me');
    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Update user profile
export const updateProfile = async (userData) => {
  try {
    const response = await authAxios.put('/me', userData);
    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

export const authService = {
  login,
  register,
  validateToken,
  getProfile,
  updateProfile
};
