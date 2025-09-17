import express from 'express';
import { 
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

// Get user's cart
router.get('/', getUserCart);

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/remove/:serviceId', removeFromCart);

// Clear cart
router.delete('/clear', clearCart);

export default router;
