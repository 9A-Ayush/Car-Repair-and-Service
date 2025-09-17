import React, { useState } from 'react';
import './Cart.css';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Cart = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleQuantityChange = (itemId, change) => {
    updateQuantity(itemId, change);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      onClose();
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Format items for the order
      const orderItems = cartItems.map(item => ({
        serviceId: item._id || item.id,
        serviceName: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity)
      }));

      const orderData = {
        items: orderItems,
        totalAmount: calculateTotal(),
        paymentMethod: 'cash', // Default to cash payment for now
        notes: '',
        shippingAddress: {
          name: user.name || '',
          phone: user.phone || ''
        }
      };

      console.log('Sending order data:', orderData);

      const response = await axiosInstance.post('/orders', orderData);
      
      console.log('Order response:', response.data);

      if (response.data && response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        onClose();
        navigate('/my-account'); // Redirect to my-account page where orders are shown
      } else {
        throw new Error(response.data?.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-modal">
      <div className="cart-header">
        <h2>Your Cart</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id || item.id} className="cart-item">
                {item.image && (
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                )}
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleQuantityChange(item._id || item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item._id || item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item._id || item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <h3>Total:</h3>
              <span>₹{calculateTotal()}</span>
            </div>
            <button 
              className="place-order-btn" 
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
