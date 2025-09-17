import express from 'express';
import { 
  createAppointment,
  getAllAppointments,
  getUserAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats,
  createChatbotAppointment
} from '../controllers/appointmentController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateAppointment } from '../middleware/validator.js';

const router = express.Router();

// Public routes - no authentication required
router.post('/', validateAppointment, createAppointment);
router.post('/chatbot', validateAppointment, createChatbotAppointment);

// Protected routes - require authentication
router.get('/user', verifyToken, getUserAppointments);
router.get('/stats', verifyToken, isAdmin, getAppointmentStats);
router.get('/:id', verifyToken, getAppointmentById);
router.put('/:id/status', verifyToken, isAdmin, updateAppointmentStatus);
router.put('/:id/cancel', verifyToken, (req, res, next) => {
  req.body.status = 'cancelled';
  next();
}, updateAppointmentStatus);
router.put('/:id', verifyToken, updateAppointment);
router.delete('/:id', verifyToken, deleteAppointment);

// Admin routes - require admin role
router.get('/', verifyToken, isAdmin, getAllAppointments);

export default router;
