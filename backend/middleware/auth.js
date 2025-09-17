import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    console.log('Verifying token...');
    console.log('Headers:', req.headers);
    
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);

    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid Authorization header format');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token);

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    if (!decoded || !decoded.id) {
      console.log('Invalid token payload');
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    console.log('User found:', user ? user._id : 'not found');

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    console.log('Token verification successful');
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(401).json({ message: 'Unauthorized access' });
  }
};

// Add `isAdmin` function
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only' });
  }
  next();
};
