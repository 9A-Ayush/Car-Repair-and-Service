import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => localStorage.removeItem('token'),
  getCurrentUser: () => api.get('/auth/me')
};

// Booking Services
export const bookingService = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  cancelBooking: (id) => api.delete(`/bookings/${id}`)
};

// Rating Services
export const ratingService = {
  submitRating: (ratingData) => api.post('/ratings', ratingData),
  getRatings: () => api.get('/ratings')
};

// Contact Services
export const contactService = {
  sendMessage: (messageData) => api.post('/contact', messageData)
};

// Appointment Services
export const appointmentService = {
  getUserAppointments: () => api.get('/appointments/user'),
  rateAppointment: (appointmentId, rating, comment) => api.post(`/appointments/${appointmentId}/rate`, { rating, comment }),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
  updateAppointmentStatus: (id, status) => api.put(`/appointments/${id}/status`, { status })
};

// Default export with common methods
const defaultApi = {
  // Auth methods
  ...authService,
  // Booking methods
  ...bookingService,
  // Rating methods
  ...ratingService,
  // Contact methods
  ...contactService,
  // Appointment methods
  ...appointmentService
};

export default defaultApi;
