import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with base URL
const ratingAxios = axios.create({
  baseURL: `${API_URL}/api/ratings`
});

// Add authorization header to requests when token exists
ratingAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Always add Bearer prefix if not present
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Format error message
const formatErrorMessage = (error) => {
  console.error('Rating service error:', error);
  
  if (!error.response && error.request) {
    return 'Connection error. Please check your internet connection and try again.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return 'Please login to submit a rating.';
  }
  
  if (error.response?.status === 400) {
    return 'Please check your input and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Submit a new rating
export const submitRating = async (ratingData) => {
  try {
    // Validate rating data
    if (!ratingData.rating) {
      throw new Error('Rating is required');
    }

    if (ratingData.rating < 1 || ratingData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const response = await ratingAxios.post('/', ratingData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to submit rating');
    }

    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

// Get all user ratings
export const getUserRatings = async () => {
  try {
    console.log('Fetching user ratings');
    const response = await ratingAxios.get('/user');
    console.log('User ratings response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Fetching user ratings error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Get rating details by ID
export const getRatingById = async (id) => {
  try {
    console.log('Fetching rating details by ID:', id);
    const response = await ratingAxios.get(`/${id}`);
    console.log('Rating details response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Fetching rating details error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Update rating
export const updateRating = async (id, ratingData) => {
  try {
    console.log('Updating rating data:', ratingData);
    const response = await ratingAxios.put(`/${id}`, ratingData);
    console.log('Rating update response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Updating rating error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Delete rating
export const deleteRating = async (id) => {
  try {
    console.log('Deleting rating by ID:', id);
    const response = await ratingAxios.delete(`/${id}`);
    console.log('Rating deletion response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Deleting rating error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Admin functions

// Get all ratings (admin only)
export const getAllRatings = async () => {
  try {
    console.log('Fetching all ratings');
    const response = await ratingAxios.get('/');
    console.log('All ratings response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Fetching all ratings error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Get rating statistics (admin only)
export const getRatingStats = async () => {
  try {
    console.log('Fetching rating statistics');
    const response = await ratingAxios.get('/stats');
    console.log('Rating statistics response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Fetching rating stats error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};
