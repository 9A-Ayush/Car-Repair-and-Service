import express from 'express';
import { 
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes (require authentication)
router.use(verifyToken);

// Create a new order from cart
router.post('/', createOrder);

// Get all orders for the authenticated user
router.get('/user', getUserOrders);

// Get a specific order by ID
router.get('/:orderId', getOrderById);

// Cancel an order
router.put('/:orderId/cancel', cancelOrder);

// Admin routes
router.get('/', isAdmin, getAllOrders);
router.put('/:orderId/status', isAdmin, updateOrderStatus);

export default router;
