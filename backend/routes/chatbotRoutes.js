import express from 'express';
import {
  processMessage,
  getSuggestions,
  bookServiceAppointment,
  getServiceStatusInfo
} from '../controllers/chatbotController.js';

const router = express.Router();

// Chatbot endpoints
router.post('/message', processMessage);
router.get('/suggestions', getSuggestions);
router.post('/book-service', bookServiceAppointment);
router.get('/service-status/:bookingRef', getServiceStatusInfo);

// ... other existing routes ...

// ... rest of the file ...
export default router;