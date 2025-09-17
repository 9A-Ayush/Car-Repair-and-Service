import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Enhanced request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Details:', {
    code: err.code,
    codeName: err.codeName,
    name: err.name,
    message: err.message
  });
  process.exit(1);
});

// API Routes with error handling
app.use('/api', (req, res, next) => {
  console.log('API Request:', req.method, req.url);
  next();
}, apiRoutes);

app.use('/api/auth', (req, res, next) => {
  console.log('Auth Request:', req.method, req.url);
  next();
}, authRoutes);

app.use('/api/appointments', (req, res, next) => {
  console.log('Appointment Request:', req.method, req.url);
  next();
}, appointmentRoutes);

app.use('/api/orders', (req, res, next) => {
  console.log('Order Request:', req.method, req.url);
  next();
}, orderRoutes);

app.use('/api/ratings', ratingRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({
        message: 'Car Service and Repair API',
        version: '1.0.0',
        documentation: '/api'
    });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    console.error('Request details:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
    });
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ 
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : undefined,
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

// Handle 404 routes
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000; // Updated to match frontend expectation

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`- Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`- Appointments API: http://localhost:${PORT}/api/appointments`);
    console.log(`- Orders API: http://localhost:${PORT}/api/orders`);
    console.log(`- Ratings API: http://localhost:${PORT}/api/ratings`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});
