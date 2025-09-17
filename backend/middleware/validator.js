import { errorResponse } from '../utils/response.js';

// Validate signup data
export const validateSignup = (req, res, next) => {
    const { name, email, password } = req.body;

    // Check for missing fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
        return errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate name
    if (name.trim().length < 2) {
        return errorResponse(res, 'Name must be at least 2 characters long');
    }

    if (name.trim().length > 50) {
        return errorResponse(res, 'Name must be less than 50 characters');
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return errorResponse(res, 'Please enter a valid email address');
    }

    // Validate password strength
    if (password.length < 6) {
        return errorResponse(res, 'Password must be at least 6 characters long');
    }

    if (password.length > 50) {
        return errorResponse(res, 'Password must be less than 50 characters');
    }

    next();
};

// Validate login data
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return errorResponse(res, 'Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return errorResponse(res, 'Invalid email format');
    }

    next();
};

// Validate appointment data
export const validateAppointment = (req, res, next) => {
    const { service, date, time, vehicleDetails, customerName, email, phoneNumber } = req.body;

    // Check required fields for all bookings
    if (!service || !date || !time || !vehicleDetails) {
        return errorResponse(res, 'Service, date, time and vehicle details are required');
    }

    // For all bookings, ensure customer information is provided
    if (!customerName || !email || !phoneNumber) {
        return errorResponse(res, 'Customer name, email, and phone are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return errorResponse(res, 'Invalid email format');
    }

    // Validate phone format
    const phoneRegex = /^\+91[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return errorResponse(res, 'Phone number must start with +91 followed by 10 digits');
    }

    // Validate vehicle details
    if (!vehicleDetails || typeof vehicleDetails !== 'object') {
        return errorResponse(res, 'Invalid vehicle details format');
    }

    const { model, year, registrationNumber } = vehicleDetails;
    if (!model || !year || !registrationNumber) {
        return errorResponse(res, 'Vehicle model, year, and registration number are required');
    }

    // Validate date is in the future
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
        return errorResponse(res, 'Appointment date must be in the future');
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
        return errorResponse(res, 'Invalid time format. Use HH:MM');
    }

    // If all validations pass
    next();
};

// Validate rating data
export const validateRating = (req, res, next) => {
    const { rating, review } = req.body;

    if (!rating) {
        return errorResponse(res, 'Rating is required');
    }

    // Validate rating range (1-5)
    if (rating < 1 || rating > 5) {
        return errorResponse(res, 'Rating must be between 1 and 5');
    }

    // If review is provided, validate length
    if (review && review.length > 500) {
        return errorResponse(res, 'Review must be less than 500 characters');
    }

    next();
};
