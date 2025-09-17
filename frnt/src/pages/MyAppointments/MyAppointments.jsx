import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaTools, FaSpinner, FaCheck, FaTimes, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import api from '../../services/api';
import './MyAppointments.css';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast'; // Assuming you have react-hot-toast installed

const MyAppointments = ({ onRateClick }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getUserAppointments();
      console.log('Appointments response:', response);
      
      // Handle both array and object response formats
      const appointments = response?.data?.appointments || response?.data || [];
      if (Array.isArray(appointments)) {
        setAppointments(appointments);
      } else {
        console.error('Invalid appointments data format:', response?.data);
        setAppointments([]);
        setError('Received invalid data format from server');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || 'Failed to load your appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated
    if (isAuthenticated) {
      fetchAppointments();
    } else {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending"><FaExclamationTriangle /> Pending</span>;
      case 'confirmed':
        return <span className="status-badge confirmed"><FaCheck /> Confirmed</span>;
      case 'in-progress':
        return <span className="status-badge in-progress"><FaTools /> In Progress</span>;
      case 'completed':
        return <span className="status-badge completed"><FaCheck /> Completed</span>;
      case 'cancelled':
        return <span className="status-badge cancelled"><FaTimes /> Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRateService = (appointmentId) => {
    onRateClick(appointmentId);
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.cancelAppointment(id);
        toast.success('Appointment cancelled successfully');
        // Refresh appointments list
        fetchAppointments();
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        toast.error(err.response?.data?.message || 'Failed to cancel appointment. Please try again.');
      }
    }
  };

  const handleTryAgain = () => {
    // Directly fetch appointments again instead of reloading the page
    fetchAppointments();
  };

  if (loading) {
    return (
      <div className="my-appointments-container loading">
        <FaSpinner className="spinner" />
        <p>Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-appointments-container error">
        <FaExclamationTriangle />
        <p>{error}</p>
        <button onClick={handleTryAgain}>Try Again</button>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="my-appointments-container empty">
        <div className="page-header">
          <h1><FaCalendarAlt /> My Appointments</h1>
          <p>Manage your service appointments</p>
        </div>
        <div className="empty-state">
          <FaCalendarAlt />
          <h2>No appointments found</h2>
          <p>You don't have any service appointments yet.</p>
          <button onClick={() => navigate('/')}>Book a Service</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-appointments-container">
      <div className="page-header">
        <h1><FaCalendarAlt /> My Appointments</h1>
        <p>Manage your service appointments</p>
      </div>

      <div className="appointments-list">
        {appointments.map((appointment) => (
          <div key={appointment._id} className={`appointment-card ${appointment.status}`}>
            <div className="appointment-header">
              <h3>{appointment.service || 'Car Service'}</h3>
              {getStatusBadge(appointment.status)}
            </div>
            
            <div className="appointment-details">
              <div className="detail-item">
                <FaCalendarAlt />
                <span>Date: {formatDate(appointment.date)}</span>
              </div>
              
              <div className="detail-item">
                <FaClock />
                <span>Time: {appointment.time || 'Not specified'}</span>
              </div>
              
              <div className="detail-item">
                <FaTools />
                <span>Service: {appointment.service || 'General Service'}</span>
              </div>
            </div>
            
            <div className="appointment-notes">
              <p><strong>Notes:</strong> {appointment.notes || 'No additional notes'}</p>
            </div>
            
            <div className="appointment-actions">
              {appointment.status === 'pending' && (
                <button 
                  className="cancel-btn"
                  onClick={() => handleCancelAppointment(appointment._id)}
                >
                  Cancel Appointment
                </button>
              )}
              
              {appointment.status === 'completed' && !appointment.rated && (
                <button 
                  className="rate-btn"
                  onClick={() => handleRateService(appointment._id)}
                >
                  <FaStar /> Rate Service
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
