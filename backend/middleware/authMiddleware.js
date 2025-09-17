import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/response.js';

// Verify if the user is authenticated
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'car-service-secret-key-2025');
      
      // Handle both userId and id properties for flexibility
      const userIdentifier = decoded.userId || decoded.id;
      
      if (!userIdentifier) {
        return errorResponse(res, 'Invalid token structure', 401);
      }

      const user = await User.findById(userIdentifier).select('-password');

      if (!user) {
        return errorResponse(res, 'User not found', 401);
      }

      req.user = user;
      req.user.id = user._id.toString();
      req.token = token;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired, please log in again', 401);
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401);
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 'Authentication failed', 401);
  }
};

// Check if the user is an admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 'Access denied. Admin privileges required', 403);
  }
  next(); // Ensure this line is inside the function
};
