import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaCar, FaCalendar, FaClock } from 'react-icons/fa';
import { bookAppointment } from '../../services/appointmentService';
import { validateEmail, validatePhone, validateName, validateService, validateDate, validateTime, validateVehicleDetails } from '../../utils/validation';
import AuthModal from '../Auth/AuthModal';
import toast from 'react-hot-toast';

const BookingForm = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phoneNumber: '',
    service: '',
    date: '',
    time: '',
    message: '',
    vehicleDetails: {
      make: '',
      model: '',
      year: '',
      registrationNumber: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Update form data when user logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested vehicleDetails object
    if (name.startsWith('vehicleDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicleDetails: {
          ...prev.vehicleDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when field is changed
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateForm = (data) => {
    const newErrors = {};

    // Validate personal information
    const nameError = validateName(data.customerName);
    const emailError = validateEmail(data.email);
    const phoneError = validatePhone(data.phoneNumber);

    if (nameError) newErrors.customerName = nameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phoneNumber = phoneError;

    // Validate service details
    const serviceError = validateService(data.service);
    const dateError = validateDate(data.date);
    const timeError = validateTime(data.time);

    if (serviceError) newErrors.service = serviceError;
    if (dateError) newErrors.date = dateError;
    if (timeError) newErrors.time = timeError;

    // Validate vehicle details
    const vehicleErrors = validateVehicleDetails(data.vehicleDetails);
    if (Object.keys(vehicleErrors).length > 0) {
      Object.entries(vehicleErrors).forEach(([key, value]) => {
        newErrors[`vehicleDetails.${key}`] = value;
      });
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    setLoading(true);
    setErrors({});

    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast('Please log in to book an appointment', { icon: 'ℹ️' });
        setLoading(false);
        return;
      }

      // Format phone number
      let formattedPhone = formData.phoneNumber.replace(/[\s-]/g, '');
      if (!formattedPhone.startsWith('+91')) {
        formattedPhone = '+91' + formattedPhone.replace(/^\+?91/, '');
      }

      // Validate all fields
      const validationErrors = validateForm({
        ...formData,
        phoneNumber: formattedPhone
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        const firstError = Object.values(validationErrors)[0];
        toast(firstError, { icon: '❌' });
        setLoading(false);
        return;
      }

      // Format date to YYYY-MM-DD
      const formattedDate = new Date(formData.date).toISOString().split('T')[0];

      // Format data for submission
      const appointmentData = {
        customerName: formData.customerName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formattedPhone,
        service: formData.service,
        date: formattedDate,
        time: formData.time,
        message: formData.message || '',
        vehicleDetails: {
          make: formData.vehicleDetails.make?.trim() || 'Not Specified',
          model: formData.vehicleDetails.model.trim(),
          year: formData.vehicleDetails.year.toString().trim(),
          registrationNumber: formData.vehicleDetails.registrationNumber.toUpperCase().trim()
        }
      };

      console.log('Submitting appointment with data:', appointmentData);
      const result = await bookAppointment(appointmentData);
      
      if (result.success) {
        setSuccess(true);
        toast.success('Appointment booked successfully!');
        // Navigate to MyAccount page
        navigate('/my-account');
      } else {
        if (result.requiresAuth) {
          toast('Your session has expired. Please log in again.', { icon: 'ℹ️' });
          // Redirect to login page
          navigate('/login', { state: { from: '/book' } });
        } else {
          const errorMessage = result.error || 'Failed to book appointment. Please try again.';
          setErrors({ submit: errorMessage });
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      setErrors({ submit: errorMessage });
      toast(errorMessage, { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="booking-section" id="book">
      <div className="container">
        <h2 className="section-title">Book an Appointment</h2>
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3><FaUser /> Personal Information</h3>
            <div className="form-grid">
              {/* Always show name field for both authenticated and guest users */}
              <div className="form-group">
                <label htmlFor="customerName">Full Name</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  placeholder="Enter your full name"
                  value={formData.customerName}
                  onChange={handleChange}
                  className={errors.customerName ? 'error' : ''}
                  disabled={loading}
                />
                {errors.customerName && <span className="error-text">{errors.customerName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="+91 10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  pattern="\+91[0-9]{10}"
                  title="Please enter a valid +91 followed by 10-digit phone number"
                  className={errors.phoneNumber ? 'error' : ''}
                  disabled={loading}
                />
                {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><FaCar /> Vehicle Details</h3>
            <div className="form-grid">
              {/* Vehicle Make */}
              <div className="form-group">
                <label htmlFor="vehicleMake">Vehicle Make</label>
                <input
                  type="text"
                  id="vehicleMake"
                  name="vehicleDetails.make"
                  placeholder="Enter vehicle make"
                  value={formData.vehicleDetails.make}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Allow only letters & spaces
                    handleChange({ target: { name: 'vehicleDetails.make', value } });
                  }}
                  className={errors['vehicleDetails.make'] ? 'error' : ''}
                  disabled={loading}
                />
                {errors['vehicleDetails.make'] && 
                  <span className="error-text">{errors['vehicleDetails.make']}</span>}
              </div>

              {/* Vehicle Model */}
              <div className="form-group">
                <label htmlFor="vehicleModel">Vehicle Model</label>
                <input
                  type="text"
                  id="vehicleModel"
                  name="vehicleDetails.model"
                  placeholder="Enter vehicle model"
                  value={formData.vehicleDetails.model}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''); // Allow letters, numbers, spaces
                    handleChange({ target: { name: 'vehicleDetails.model', value } });
                  }}
                  className={errors['vehicleDetails.model'] ? 'error' : ''}
                  disabled={loading}
                />
                {errors['vehicleDetails.model'] && 
                  <span className="error-text">{errors['vehicleDetails.model']}</span>}
              </div>

              {/* Vehicle Year */}
              <div className="form-group">
                <label htmlFor="vehicleYear">Vehicle Year</label>
                <input
                  type="text"
                  id="vehicleYear"
                  name="vehicleDetails.year"
                  placeholder="Enter vehicle year"
                  value={formData.vehicleDetails.year}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only numbers, max 4 digits
                    const currentYear = new Date().getFullYear();
                    if (value && (parseInt(value) < 1886 || parseInt(value) > currentYear)) {
                      errors['vehicleDetails.year'] = `Year must be between 1886 and ${currentYear}`;
                    } else {
                      errors['vehicleDetails.year'] = '';
                    }
                    handleChange({ target: { name: 'vehicleDetails.year', value } });
                  }}
                  className={errors['vehicleDetails.year'] ? 'error' : ''}
                  disabled={loading}
                />
                {errors['vehicleDetails.year'] && 
                  <span className="error-text">{errors['vehicleDetails.year']}</span>}
              </div>

              {/* Registration Number */}
              <div className="form-group">
                <label htmlFor="registrationNumber">Registration Number</label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="vehicleDetails.registrationNumber"
                  placeholder="Enter registration number"
                  value={formData.vehicleDetails.registrationNumber}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Allow only uppercase letters & numbers
                    handleChange({ target: { name: 'vehicleDetails.registrationNumber', value } });
                  }}
                  className={errors['vehicleDetails.registrationNumber'] ? 'error' : ''}
                  disabled={loading}
                />
                {errors['vehicleDetails.registrationNumber'] && 
                  <span className="error-text">{errors['vehicleDetails.registrationNumber']}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><FaCalendar /> Appointment Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="service">Service Type</label>
                <select 
                  id="service"
                  name="service" 
                  value={formData.service} 
                  onChange={handleChange}
                  required
                  className={errors.service ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select Service</option>
                  <option value="Regular Maintenance">Regular Maintenance</option>
                  <option value="Engine Repair">Engine Repair</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tire Service">Tire Service</option>
                  <option value="AC Service">AC Service</option>
                  <option value="Other">Other Service</option>
                </select>
                {errors.service && <span className="error-text">{errors.service}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="date">Preferred Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className={errors.date ? 'error' : ''}
                  disabled={loading}
                />
                {errors.date && <span className="error-text">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="time">Preferred Time</label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className={errors.time ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select Time</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
                {errors.time && <span className="error-text">{errors.time}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group full-width">
              <label htmlFor="message">Additional Notes (Optional)</label>
              <textarea
                id="message"
                name="message"
                placeholder="Any specific requirements or concerns?"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className={errors.message ? 'error' : ''}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default BookingForm;
