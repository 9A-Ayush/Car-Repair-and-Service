import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { successResponse, errorResponse, serverError } from '../utils/response.js';
import { sendOrderConfirmationEmail } from '../utils/notifications.js';
import User from '../models/User.js';

// Create a new order from cart
export const createOrder = async (req, res) => {
  try {
    console.log('Creating order with data:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      console.error('No user ID found in request');
      return errorResponse(res, 'Authentication required', 401);
    }

    const { items, totalAmount, paymentMethod, shippingAddress, notes } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid items:', items);
      return errorResponse(res, 'Items are required and must be an array', 400);
    }

    if (!totalAmount || isNaN(totalAmount)) {
      console.error('Invalid total amount:', totalAmount);
      return errorResponse(res, 'Valid total amount is required', 400);
    }

    if (!paymentMethod) {
      console.error('Missing payment method');
      return errorResponse(res, 'Payment method is required', 400);
    }

    // Validate each item
    for (const item of items) {
      if (!item.serviceId || !item.serviceName || !item.price || !item.quantity) {
        console.error('Invalid item:', item);
        return errorResponse(res, 'Each item must have serviceId, serviceName, price, and quantity', 400);
      }
      
      // Ensure price and quantity are numbers
      if (isNaN(item.price) || isNaN(item.quantity)) {
        console.error('Invalid price or quantity:', item);
        return errorResponse(res, 'Price and quantity must be valid numbers', 400);
      }
    }
    
    // Create new order
    const order = new Order({
      userId,
      items,
      totalAmount: Number(totalAmount),
      paymentMethod,
      shippingAddress: shippingAddress || {},
      notes: notes || ''
    });

    console.log('Saving order:', JSON.stringify(order, null, 2));
    
    // Save the order
    await order.save();
    console.log('Order saved successfully');
    
    // Get user email for sending confirmation
    const user = await User.findById(userId);
    console.log('Found user:', user?.email);
    
    if (user && user.email) {
      try {
        await sendOrderConfirmationEmail(user.email, {
          orderNumber: order.orderNumber,
          items: order.items,
          totalAmount: order.totalAmount,
          date: order.createdAt
        });
        console.log('Order confirmation email sent');
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Continue even if email fails
      }
    }
    
    return successResponse(res, 'Order created successfully', { 
      order: {
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      } 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    return serverError(res, error);
  }
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });
    
    return successResponse(res, 'Orders retrieved successfully', { orders });
  } catch (error) {
    console.error('Error retrieving orders:', error);
    return serverError(res, error);
  }
};

// Get a specific order by ID
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { orderId } = req.params;
    
    const order = await Order.findOne({ 
      _id: orderId,
      userId
    });
    
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    successResponse(res, 'Order retrieved successfully', { order });
  } catch (error) {
    console.error('Error retrieving order:', error);
    serverError(res, error);
  }
};

// Cancel an order
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { orderId } = req.params;
    
    const order = await Order.findOne({ 
      _id: orderId,
      userId
    });
    
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return errorResponse(res, 'Cannot cancel order that is not in pending status', 400);
    }
    
    order.status = 'cancelled';
    await order.save();
    
    successResponse(res, 'Order cancelled successfully', { order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    serverError(res, error);
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    successResponse(res, 'All orders retrieved successfully', { orders });
  } catch (error) {
    console.error('Error retrieving all orders:', error);
    serverError(res, error);
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    if (status) {
      order.status = status;
    }
    
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    
    await order.save();
    
    successResponse(res, 'Order status updated successfully', { order });
  } catch (error) {
    console.error('Error updating order status:', error);
    serverError(res, error);
  }
};
