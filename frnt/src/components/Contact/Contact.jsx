import React, { useState, useRef } from 'react';
import './Contact.css';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp } from 'react-icons/fa';
import { validateEmail, validateName, validateMessage } from '../../utils/validation';

const Contact = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [touched, setTouched] = useState({});
  const [result, setResult] = useState('');

  // Map styles for container
  const mapStyles = {
    height: '450px',
    width: '100%',
    border: 0
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'message':
        error = validateMessage(value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult('Sending....');

    // Validate all fields
    const isValid = Object.keys(formData).every((key) => validateField(key, formData[key]));

    if (!isValid) {
      setResult('Please correct the errors in the form.');
      return;
    }

    const formDataToSend = new FormData();
    // Add each field manually to ensure proper data transmission
    formDataToSend.append('access_key', '820f2b2f-872d-4174-9b44-882968578790');
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('message', formData.message);
    // Add your email where you want to receive messages
    formDataToSend.append('from_name', 'Car Care Website');
    formDataToSend.append('to_email', 'wemayush@gmail.com'); // Replace with your email

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setResult('Form Submitted Successfully');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        console.log('Error', data);
        setResult(data.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setResult('Failed to submit message. Please try again.');
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-header">
        <h2>Get in Touch</h2>
        <p>We'd love to hear from you. Here's how you can reach us...</p>
      </div>

      <div className="contact-wrapper">
        <div className="contact-info-section">
          <div className="info-card">
            <div className="info-header">
              <FaMapMarkerAlt className="info-icon" />
              <h3>Visit Us</h3>
            </div>
            <p>CYBER THANA</p>
            <p>Gopalganj, Bihar</p>
            <a
              href="https://www.google.com/maps?q=26.46460951877744,84.44321239276798"
              target="_blank"
              rel="noopener noreferrer"
              className="direction-link"
            >
              Get Directions
            </a>
          </div>

          <div className="info-card">
            <div className="info-header">
              <FaClock className="info-icon" />
              <h3>Business Hours</h3>
            </div>
            <div className="hours-grid">
              <span>Monday - Friday:</span>
              <span>9:00 AM - 6:00 PM</span>
              <span>Saturday:</span>
              <span>10:00 AM - 4:00 PM</span>
              <span>Sunday:</span>
              <span>Closed</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <FaPhone className="info-icon" />
              <h3>Contact Info</h3>
            </div>
            <div className="contact-links">
              <a href="tel:+919472548097">
                <FaPhone /> +91 9472548097
              </a>
              <a href="mailto:info@carcare.com">
                <FaEnvelope /> info@carcare.com
              </a>
              <a href="https://wa.me/+919472548097" className="whatsapp-link">
                <FaWhatsapp /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="contact-main-content">
          <div className="map-section">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d959.2543342684211!2d84.44321239276798!3d26.46460951877744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39931bd004c6c731%3A0x37f1869eb5927930!2sCYBER%20THANA%2C%20GOPALGANJ!5e0!3m2!1sen!2sin!4v1742928775464!5m2!1sen!2sin" 
              width="100%" 
              height="450" 
              style={mapStyles}
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            ></iframe>
          </div>

          <div className="contact-form-section">
            <h3>Send us a Message</h3>
            <form onSubmit={onSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    className={errors.name && touched.name ? 'error' : ''}
                  />
                  {touched.name && errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    className={errors.email && touched.email ? 'error' : ''}
                  />
                  {touched.email && errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={() => handleBlur('message')}
                  rows="5"
                  className={errors.message && touched.message ? 'error' : ''}
                ></textarea>
                {touched.message && errors.message && (
                  <span className="error-message">{errors.message}</span>
                )}
              </div>
              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
            <span>{result}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
