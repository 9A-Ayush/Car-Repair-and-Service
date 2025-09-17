import React, { useState, useEffect } from 'react';
import './MyAccount.css';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHistory,
  FaShoppingBag,
  FaStar,
  FaSignOutAlt,
  FaEdit,
  FaCheck,
  FaTimes,
  FaCalendar,
  FaClock,
  FaBox,
  FaRupeeSign,
  FaSpinner
} from 'react-icons/fa';
import axiosInstance from '../../utils/axios';
import { getUserAppointments } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const MyAccount = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, logout: authLogout, error: authError } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedServices: 0,
    totalOrders: 0,
    savedAmount: 0,
    totalSpent: 0
  });

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First check if we're authenticated
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to home');
        navigate('/');
        return;
      }

      // Use user data from auth context if available
      if (authUser) {
        console.log('Using auth context user data');
        setUserData(authUser);
        setEditedData(authUser);
      } else {
        // If not in context, fetch from API
        console.log('Fetching user data from API');
        const response = await axiosInstance.get('/api/auth/me');
        
        if (response?.data?.user) {
          const user = response.data.user;
          setUserData(user);
          setEditedData(user);
        } else {
          throw new Error('Invalid response format');
        }
      }

      // Fetch appointments
      await fetchAppointments();
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load profile';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If unauthorized, redirect to home
      if (error.response?.status === 401) {
        authLogout();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user appointments
  const fetchAppointments = async () => {
    try {
      console.log('Starting to fetch appointments...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        throw new Error('Please log in again');
      }

      const response = await getUserAppointments();
      console.log('getUserAppointments response:', response);
      
      if (response.success && Array.isArray(response.appointments)) {
        setAppointments(response.appointments);
        setStats(prevStats => ({
          ...prevStats,
          totalBookings: response.appointments.length,
          completedServices: response.appointments.filter(apt => apt.status === 'completed').length
        }));
      } else {
        throw new Error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load appointments';
      toast.error(errorMessage);
      
      // If unauthorized, redirect to home
      if (error.response?.status === 401) {
        authLogout();
        navigate('/');
      }
      
      setAppointments([]);
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const response = await axiosInstance.get('/orders/user');
      console.log('Orders response:', response.data);
      
      if (response && response.data && response.data.data && response.data.data.orders) {
        const userOrders = response.data.data.orders;
        setOrders(userOrders);
        
        // Update stats
        const totalOrderAmount = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        setStats(prev => ({
          ...prev,
          totalOrders: userOrders.length,
          totalSpent: totalOrderAmount
        }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    }
  };

  // Fetch user data and appointments on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserData(),
          fetchOrders()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load your account data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await axiosInstance.put('/auth/update-profile', editedData);
      setUserData(editedData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Handle logout
  const handleLogout = () => {
    try {
      console.log('Logging out...');
      authLogout();
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to logout');
      // Force logout even if there's an error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/', { replace: true });
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="my-account">
        <div className="my-account-container">
          <div className="loading-state">
            <FaSpinner className="icon spinning" />
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-account">
        <div className="my-account-container">
          <div className="error-state">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account">
      <div className="my-account-container">
        <div className="profile-header">
          <h1>My Account</h1>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <div className="card-header">
              <h2>
                <FaUser className="icon" /> Profile Information
              </h2>
              <button 
                className="edit-btn" 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <FaTimes /> : <FaEdit />}
              </button>
            </div>
            <div className="profile-info">
              <div className="info-group">
                <FaUser className="icon" />
                <input
                  type="text"
                  name="name"
                  value={isEditing ? editedData.name || '' : userData.name || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder={isEditing ? 'Enter your name' : 'No name added'}
                />
              </div>
              <div className="info-group">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  value={isEditing ? editedData.email || '' : userData.email || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder={isEditing ? 'Enter your email' : 'No email added'}
                />
              </div>
              <div className="info-group">
                <FaPhone className="icon" />
                <input
                  type="tel"
                  name="phone"
                  value={isEditing ? editedData.phone || '' : userData.phone || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder={isEditing ? 'Enter your phone' : 'No phone added'}
                />
              </div>
              <div className="info-group">
                <FaMapMarkerAlt className="icon" />
                <input
                  type="text"
                  name="address"
                  value={isEditing ? editedData.address || '' : userData.address || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder={isEditing ? 'Enter your address' : 'No address added'}
                />
              </div>
              {isEditing && (
                <button className="save-btn" onClick={handleSaveProfile}>
                  <FaCheck /> Save Changes
                </button>
              )}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h2>
                <FaHistory className="icon" /> Recent Bookings
              </h2>
            </div>
            <div className="bookings-list">
              {loading ? (
                <div className="loading-state">
                  <FaSpinner className="icon spinning" />
                  <p>Loading bookings...</p>
                </div>
              ) : appointments.length > 0 ? (
                appointments.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <h3>{booking.service}</h3>
                      <span className={`status ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="booking-details">
                      <p>
                        <FaCalendar /> {new Date(booking.date).toLocaleDateString()}
                      </p>
                      <p>
                        <FaClock /> {booking.time || 'Not specified'}
                      </p>
                      <p>
                        <FaRupeeSign /> {booking.price || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FaHistory className="icon" />
                  <p>No bookings yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h2>
                <FaShoppingBag className="icon" /> Recent Orders
              </h2>
            </div>
            <div className="orders-list">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <span className="delivery-date">
                        {(() => {
                          const orderDate = new Date(order.createdAt);
                          const deliveryDate = new Date(orderDate);
                          deliveryDate.setDate(orderDate.getDate() + 7);
                          return deliveryDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
                        })()}
                      </span>
                    </div>
                    <div className="order-details">
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <span className="item-name">{item.serviceName}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                            <span className="item-price">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-footer">
                        <p>
                          <FaCalendar /> {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="order-total">
                          <FaRupeeSign /> Total: {order.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FaShoppingBag className="icon" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={() => navigate('/my-appointments')}>
            <FaCalendar /> View All Appointments
          </button>
          <button className="btn btn-outline" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
