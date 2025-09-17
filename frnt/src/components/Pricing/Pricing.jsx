import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './Pricing.css';

const services = [
  {
    id: 1,
    name: 'Regular Maintenance',
    description: 'Complete car check-up including oil, filters, and basic diagnostics',
    price: 2999,
    duration: '2-3 hours',
    icon: '🔧'
  },
  {
    id: 2,
    name: 'Engine Repair',
    description: 'Full engine diagnostic and repair service',
    price: 5999,
    duration: '4-5 hours',
    icon: '🚗'
  },
  {
    id: 3,
    name: 'Brake Service',
    description: 'Brake inspection, repair, and maintenance',
    price: 1999,
    duration: '1-2 hours',
    icon: '🛑'
  },
  {
    id: 4,
    name: 'Oil Change',
    description: 'Premium quality oil change service',
    price: 999,
    duration: '30-45 mins',
    icon: '🛢️'
  },
  {
    id: 5,
    name: 'Tire Service',
    description: 'Tire rotation, balancing, and alignment',
    price: 1499,
    duration: '1 hour',
    icon: '🛞'
  },
  {
    id: 6,
    name: 'AC Service',
    description: 'Complete AC system check and maintenance',
    price: 2499,
    duration: '2-3 hours',
    icon: '❄️'
  }
];

const Pricing = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phoneNumber: '',
    date: '',
    time: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const { isAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setBookingStatus({
        success: false,
        message: 'Please log in to book a service.'
      });
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        ...formData,
        service: selectedService.name,
        price: selectedService.price
      };

      const response = await api.createBooking(bookingData);
      
      setBookingStatus({
        success: true,
        message: `Booking confirmed! Reference: ${response.data.bookingRef}. Check your email and phone for details.`
      });
      
      // Reset form
      setFormData({
        customerName: '',
        email: '',
        phoneNumber: '',
        date: '',
        time: '',
        message: ''
      });
      setSelectedService(null);
    } catch (error) {
      setBookingStatus({
        success: false,
        message: error.response?.data?.message || 'Sorry, there was an error processing your booking. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for date input min
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="pricing-container">
      <h1 className="pricing-title">Our Services & Pricing</h1>
      <p className="pricing-subtitle">Choose from our range of professional car services</p>

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <div className="service-details">
              <span className="price">₹{service.price}</span>
              <span className="duration">{service.duration}</span>
            </div>
            <button 
              className="book-button"
              onClick={() => handleServiceSelect(service)}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>

      {selectedService && (
        <div id="booking-form" className="booking-section">
          <h2>Book {selectedService.name}</h2>
          <p className="booking-price">Price: ₹{selectedService.price}</p>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="customerName">Full Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                pattern="[0-9+\s-]{10,}"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Preferred Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Preferred Time *</label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Additional Notes</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            {bookingStatus && (
              <div className={`booking-status ${bookingStatus.success ? 'success' : 'error'}`}>
                {bookingStatus.message}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Pricing;
