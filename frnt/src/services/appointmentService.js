import axios from 'axios';
import { APPOINTMENTS_API_URL } from '../config';

// Create axios instance with default config
const appointmentAxios = axios.create({
  baseURL: APPOINTMENTS_API_URL,  // Use the correct API URL from config
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 second timeout
});

// Add token to requests if available
appointmentAxios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // Log token for debugging (without exposing full token)
      console.log('Adding token to appointment request');
      
      // Add token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found for appointment request');
    }
    return config;
  } catch (error) {
    console.error('Error in appointment request interceptor:', error);
    return Promise.reject(error);
  }
}, (error) => {
  console.error('Appointment request interceptor error:', error);
  return Promise.reject(error);
});

// Handle response errors
appointmentAxios.interceptors.response.use(
  (response) => {
    console.log('Appointment response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    console.error('Appointment response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Check if there's a connection error
const isConnectionError = (error) => {
  return !error.response && error.request;
};

// Format error message
const formatErrorMessage = (error) => {
  if (isConnectionError(error)) {
    return 'Connection error. Please check your internet connection and try again.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return 'Please login to book an appointment.';
  }
  
  if (error.response?.status === 400) {
    return 'Please check your input and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Book a new appointment
export const bookAppointment = async (appointmentData) => {
  try {
    console.log('Starting appointment booking process...');
    console.log('Appointment data:', appointmentData);

    // Format the date to YYYY-MM-DD format
    const formattedDate = new Date(appointmentData.date).toISOString().split('T')[0];

    // Format the data according to the API expectations
    const formattedData = {
      customerName: appointmentData.customerName.trim(),
      email: appointmentData.email.trim().toLowerCase(),
      phoneNumber: appointmentData.phoneNumber.trim(),
      service: appointmentData.service,
      date: formattedDate,
      time: appointmentData.time,
      message: appointmentData.message || '',
      vehicleDetails: {
        make: appointmentData.vehicleDetails.make?.trim() || 'Not Specified',
        model: appointmentData.vehicleDetails.model.trim(),
        year: appointmentData.vehicleDetails.year.toString().trim(),
        registrationNumber: appointmentData.vehicleDetails.registrationNumber.toUpperCase().trim()
      }
    };

    console.log('Formatted data for API:', formattedData);

    // Make the API call using the configured axios instance
    const response = await appointmentAxios.post('/', formattedData);

    console.log('API Response:', response);
    
    if (response.data) {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      error: 'No data received from server'
    };

  } catch (error) {
    console.error('Error in bookAppointment:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Session expired. Please log in again.',
        requiresAuth: true
      };
    }
    
    if (error.response?.status === 400) {
      return {
        success: false,
        error: error.response.data.message || 'Invalid input data. Please check your form and try again.'
      };
    }

    if (error.response?.status === 500) {
      return {
        success: false,
        error: 'Server error. Please try again later.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'An unexpected error occurred. Please try again.'
    };
  }
};

// Get all user appointments
export const getUserAppointments = async () => {
  try {
    console.log('Fetching user appointments...');
    const response = await appointmentAxios.get('/user');
    console.log('Raw appointments response:', response.data);
    
    // The backend returns { success: true, appointments: [...] }
    if (response.data && response.data.success && Array.isArray(response.data.appointments)) {
      return response.data;  // Return the response as is
    } else {
      console.error('Unexpected appointments response format:', response.data);
      return {
        success: false,
        error: 'Invalid response format',
        appointments: []
      };
    }
  } catch (error) {
    console.error('Fetching appointments error:', error);
    return {
      success: false,
      error: formatErrorMessage(error),
      appointments: []
    };
  }
};

// Get appointment details by ID
export const getAppointmentById = async (id) => {
  try {
    const response = await appointmentAxios.get(`/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Fetching appointment details error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Update appointment
export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await appointmentAxios.put(`/${id}`, appointmentData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Updating appointment error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Cancel appointment
export const cancelAppointment = async (id) => {
  try {
    const response = await appointmentAxios.put(`/${id}/cancel`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Cancelling appointment error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Book a new appointment through chatbot (works for both logged-in and anonymous users)
export const bookChatbotAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(`${APPOINTMENTS_API_URL}/chatbot`, appointmentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Booking chatbot appointment error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Admin functions

// Get all appointments (admin only)
export const getAllAppointments = async () => {
  try {
    const response = await appointmentAxios.get('/');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch appointments. Please try again.'
    };
  }
};

// Update appointment status (admin only)
export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await appointmentAxios.put(`/${id}/status`, { status });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update appointment status. Please try again.'
    };
  }
};

// Get appointment statistics (admin only)
export const getAppointmentStats = async () => {
  try {
    const response = await appointmentAxios.get('/stats');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch appointment statistics. Please try again.'
    };
  }
};
