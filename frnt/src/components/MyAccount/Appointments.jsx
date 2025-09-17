import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserAppointments } from '../../services/appointmentService';
import './Appointments.css';

const Appointments = () => {
  const { isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      
      // Set up an interval to refresh appointments every minute
      const refreshInterval = setInterval(fetchAppointments, 60000);
      
      return () => {
        clearInterval(refreshInterval);
      };
    }
  }, [isAuthenticated]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getUserAppointments();
      
      if (response.success) {
        setAppointments(response.data.appointments || []);
      } else {
        console.error('Failed to fetch appointments:', response.error);
        setAppointments([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.updateAppointmentStatus(appointmentId, newStatus);
      // Refresh appointments after status update
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await api.cancelAppointment(appointmentId);
      // Refresh appointments after cancellation
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  if (loading) {
    return <div className="appointments-loading">Loading appointments...</div>;
  }

  if (error) {
    return <div className="appointments-error">{error}</div>;
  }

  return (
    <div className="appointments-container">
      <h2>My Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment._id} className={`appointment-card ${appointment.status}`}>
              <div className="appointment-header">
                <h3>{appointment.service}</h3>
                <span className={`status-badge ${appointment.status}`}>{appointment.status}</span>
              </div>

              <div className="appointment-details">
                <p>
                  <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {appointment.time}
                </p>
                <div className="vehicle-info">
                  <p>
                    <strong>Vehicle:</strong> {appointment.vehicleDetails}
                  </p>
                </div>
                {appointment.notes && (
                  <p className="appointment-notes">
                    <strong>Notes:</strong> {appointment.notes}
                  </p>
                )}
              </div>

              <div className="appointment-actions">
                {appointment.status === 'pending' && (
                  <button
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                )}
                {appointment.status === 'completed' && !appointment.hasRating && (
                  <button
                    onClick={() => (window.location.href = `/rate/${appointment._id}`)}
                    className="btn-rate"
                  >
                    Rate Service
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
