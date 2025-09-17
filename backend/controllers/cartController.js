import Cart from '../models/Cart.js';
import { successResponse, errorResponse, serverError } from '../utils/response.js';

// Get user's cart
export const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create a new empty cart if none exists
      cart = new Cart({
        userId,
        items: []
      });
      await cart.save();
    }
    
    successResponse(res, 'Cart retrieved successfully', { cart });
  } catch (error) {
    console.error('Error retrieving cart:', error);
    serverError(res, error);
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { serviceId, serviceName, price, quantity = 1 } = req.body;
    
    // Validate required fields
    if (!serviceId || !serviceName || !price) {
      return errorResponse(res, 'Service ID, name, and price are required');
    }
    
    // Find user's cart or create a new one
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({
        userId,
        items: []
      });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.serviceId.toString() === serviceId.toString()
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        serviceId,
        serviceName,
        price,
        quantity
      });
    }
    
    await cart.save();
    
    successResponse(res, 'Item added to cart successfully', { cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    serverError(res, error);
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { serviceId, quantity } = req.body;
    
    if (!serviceId || !quantity) {
      return errorResponse(res, 'Service ID and quantity are required');
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return errorResponse(res, 'Cart not found', 404);
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => 
      item.serviceId.toString() === serviceId.toString()
    );
    
    if (itemIndex === -1) {
      return errorResponse(res, 'Item not found in cart', 404);
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    
    successResponse(res, 'Cart updated successfully', { cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    serverError(res, error);
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { serviceId } = req.params;
    
    if (!serviceId) {
      return errorResponse(res, 'Service ID is required');
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return errorResponse(res, 'Cart not found', 404);
    }
    
    // Remove the item from the cart
    cart.items = cart.items.filter(item => 
      item.serviceId.toString() !== serviceId.toString()
    );
    
    await cart.save();
    
    successResponse(res, 'Item removed from cart successfully', { cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    serverError(res, error);
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    // Find user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return errorResponse(res, 'Cart not found', 404);
    }
    
    // Clear all items
    cart.items = [];
    
    await cart.save();
    
    successResponse(res, 'Cart cleared successfully', { cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    serverError(res, error);
  }
};
