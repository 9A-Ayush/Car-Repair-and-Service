import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaArrowUp } from 'react-icons/fa';
import { IoCarSport } from 'react-icons/io5';
import axios from 'axios';
import './Chatbot.css';
import { useAuth } from '../../context/AuthContext';
import { bookChatbotAppointment } from '../../services/appointmentService';

const Chatbot = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "👋 Hi! I'm Revvy car service assistant. How can I help you today?",
      options: [
        '🔧 Book a Service',
        '📞 Get Contact Details',
        '🚗 View Services',
        '⏰ Operating Hours',
        '📋 Check Service Status'
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    customerName: '',
    email: '',
    phoneNumber: '',
    service: '',
    date: '',
    time: '',
    message: '',
    userId: ''
  });
  const [bookingStep, setBookingStep] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Pre-fill user data if authenticated
    if (isAuthenticated && user) {
      setBookingData(prev => ({
        ...prev,
        customerName: user.name || user.username || '',
        email: user.email || '',
        phoneNumber: user.phone || '',
        userId: user._id || ''
      }));
    }
  }, [isAuthenticated, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleOptionClick = async (option) => {
    const cleanOption = option.replace(/[🔧📞🚗⏰📋]/g, '').trim();
    setMessages(prev => [...prev, { type: 'user', content: cleanOption }]);
    setIsLoading(true);

    let response;
    switch (cleanOption) {
      case 'Book a Service':
        // If user is authenticated, skip to service selection
        if (isAuthenticated && user) {
          setBookingStep(4);
          response = {
            type: 'bot',
            content: `Hi ${user.name || user.username || 'there'}! Let's book a service for you. Which service would you like?`,
            options: [
              '🔧 Regular Maintenance',
              '🚗 Engine Repair',
              '🛑 Brake Service',
              '🛢️ Oil Change',
              '🛞 Tire Service',
              '❄️ AC Service'
            ]
          };
        } else {
          setBookingStep(1);
          response = {
            type: 'bot',
            content: "Let's help you book a service. Please enter your name:",
            options: []
          };
        }
        break;

      case 'Get Contact Details':
        response = {
          type: 'bot',
          content: `Here's how you can reach us:
          
📞 Phone: +919472548097
📧 Email: service@carservice.com
📍 Address: Cyber Thana, Gopalganj

What would you like to do?`,
          options: ['📱 Call Now', '✉️ Send Email', '🔧 Book a Service']
        };
        break;

      case 'Call Now':
        window.location.href = 'tel:+919472548097';
        response = {
          type: 'bot',
          content: "📱 Initiating call... Would you like to do anything else?",
          options: ['🔧 Book a Service', '📞 Get Contact Details', '🚗 View Services']
        };
        break;

      case 'Send Email':
        window.location.href = 'mailto:service@carservice.com';
        response = {
          type: 'bot',
          content: "✉️ Opening email... Would you like to do anything else?",
          options: ['🔧 Book a Service', '📞 Get Contact Details', '🚗 View Services']
        };
        break;

      case 'View Services':
        response = {
          type: 'bot',
          content: `We offer the following services:

🔧 Regular Maintenance - Complete car check-up
🚗 Engine Repair - Diagnostic and repair
🛑 Brake Service - Inspection and maintenance
🛢️ Oil Change - High-quality oil service
🛞 Tire Service - Rotation and alignment
❄️ AC Service - Cooling system maintenance

Would you like to book any of these services?`,
          options: ['🔧 Book a Service', '💰 Get Pricing', '📞 Contact Us']
        };
        break;

      case 'Operating Hours':
        response = {
          type: 'bot',
          content: `Our service center is open:

📅 Monday - Friday: 8:00 AM - 6:00 PM
📅 Saturday: 9:00 AM - 4:00 PM
🔒 Sunday: Closed

Would you like to:`,
          options: ['🔧 Book a Service', '📞 Get Contact Details']
        };
        break;

      case 'Check Service Status':
        response = {
          type: 'bot',
          content: "Please enter your booking reference number:",
          options: []
        };
        break;

      default:
        response = {
          type: 'bot',
          content: "I understand you want to " + cleanOption.toLowerCase() + ". How can I help you with that?",
          options: ['🔧 Book a Service', '📞 Get Contact Details', '🚗 View Services']
        };
    }

    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  const handleBookingStep = async (value) => {
    const validation = validateBookingStep(bookingStep, value);
    if (!validation.isValid) {
      setMessages(prev => [...prev,
        { type: 'user', content: value },
        { 
          type: 'bot', 
          content: validation.message,
          options: ['↩️ Try Again']
        }
      ]);
      return;
    }

    switch (bookingStep) {
      case 1:
        setBookingData(prev => ({ ...prev, customerName: value }));
        setMessages(prev => [...prev,
          { type: 'user', content: value },
          { type: 'bot', content: "Great! Please enter your email address:" }
        ]);
        setBookingStep(2);
        break;

      case 2:
        setBookingData(prev => ({ ...prev, email: value }));
        setMessages(prev => [...prev,
          { type: 'user', content: value },
          { type: 'bot', content: "Please enter your phone number:" }
        ]);
        setBookingStep(3);
        break;

      case 3:
        setBookingData(prev => ({ ...prev, phoneNumber: value }));
        setMessages(prev => [...prev,
          { type: 'user', content: value },
          {
            type: 'bot',
            content: "Which service would you like to book?",
            options: [
              '🔧 Regular Maintenance',
              '🚗 Engine Repair',
              '🛑 Brake Service',
              '🛢️ Oil Change',
              '🛞 Tire Service',
              '❄️ AC Service'
            ]
          }
        ]);
        setBookingStep(4);
        break;

      case 4:
        const cleanService = value.replace(/[🔧🚗🛑🛢️🛞❄️]/g, '').trim();
        setBookingData(prev => ({ ...prev, service: cleanService }));
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];
        
        setMessages(prev => [...prev,
          { type: 'user', content: value },
          {
            type: 'bot',
            content: "📅 Please select your preferred date:",
            options: [
              `Today (${today})`,
              `Tomorrow (${tomorrow})`,
              `${dayAfter}`
            ]
          }
        ]);
        setBookingStep(5);
        break;

      case 5:
        const date = value.includes('(') ? value.split('(')[1].split(')')[0] : value;
        setBookingData(prev => ({ ...prev, date }));
        setMessages(prev => [...prev,
          { type: 'user', content: value },
          {
            type: 'bot',
            content: "⏰ Please select your preferred time:",
            options: [
              '🌅 09:00 AM',
              '🌅 10:00 AM',
              '🌅 11:00 AM',
              '🌇 02:00 PM',
              '🌇 03:00 PM',
              '🌇 04:00 PM'
            ]
          }
        ]);
        setBookingStep(6);
        break;

      case 6:
        const cleanTime = value.replace(/[🌅🌇]/g, '').trim();
        setBookingData(prev => ({ ...prev, time: cleanTime }));
        setMessages(prev => [...prev,
          { type: 'user', content: value },
          {
            type: 'bot',
            content: "✍️ Any additional notes or requirements? (Optional)",
            options: ['📝 No additional notes', '✏️ Type your message']
          }
        ]);
        setBookingStep(7);
        break;

      case 7:
        const finalNotes = value.includes('No additional notes') ? '' : value.replace(/[📝✏️]/g, '').trim();
        setBookingData(prev => ({ ...prev, message: finalNotes }));
        try {
          setIsLoading(true);
          
          // Format appointment data properly
          const appointmentData = {
            customerName: bookingData.customerName,
            email: bookingData.email,
            phoneNumber: bookingData.phoneNumber,
            service: bookingData.service,
            date: bookingData.date,
            time: bookingData.time,
            message: finalNotes,
            // Add userId if authenticated
            userId: isAuthenticated && user ? user._id : 'anonymous',
            // Add vehicle details (required by the API)
            vehicleDetails: "Not specified" // Default value if not provided
          };
          
          console.log("Sending appointment data:", appointmentData);
          const response = await bookChatbotAppointment(appointmentData);
          console.log("Appointment response:", response);
          
          if (response.success) {
            const bookingRef = response.data.bookingRef || (response.data.appointment && response.data.appointment.bookingRef) || 'BOK' + Date.now();
            setMessages(prev => [...prev,
              { type: 'user', content: value },
              {
                type: 'bot',
                content: `✅ Your booking has been confirmed!

🎫 Booking Reference: ${bookingRef}
📧 We'll send you a confirmation email shortly.

What would you like to do next?`,
                options: ['🔧 Book Another Service', '📋 Check Service Status', '📞 Contact Us']
              }
            ]);
          } else {
            throw new Error(response.error || 'Failed to book appointment');
          }
        } catch (error) {
          console.error("Booking error details:", error);
          setMessages(prev => [...prev,
            { type: 'user', content: value },
            {
              type: 'bot',
              content: `❌ I apologize, but there was an error processing your booking: ${error.message || 'Unknown error'}. Would you like to try again or contact support?`,
              options: ['↩️ Try Again', '📞 Contact Support']
            }
          ]);
        } finally {
          setIsLoading(false);
          setBookingStep(0);
          // Reset booking data but preserve user info if authenticated
          if (isAuthenticated && user) {
            setBookingData({
              customerName: user.name || user.username || '',
              email: user.email || '',
              phoneNumber: user.phone || '',
              userId: user._id || '',
              service: '',
              date: '',
              time: '',
              message: '',
            });
          } else {
            setBookingData({
              customerName: '',
              email: '',
              phoneNumber: '',
              service: '',
              date: '',
              time: '',
              message: '',
              userId: ''
            });
          }
        }
        break;
    }
  };

  const handleUserInput = async (input) => {
    if (!input.trim()) return;

    if (bookingStep > 0) {
      await handleBookingStep(input);
    } else {
      setMessages(prev => [...prev, { type: 'user', content: input }]);
      setIsLoading(true);

      try {
        // Include userId and sessionId in the request
        const sessionId = localStorage.getItem('chatSessionId') || `session_${Date.now()}`;
        if (!localStorage.getItem('chatSessionId')) {
          localStorage.setItem('chatSessionId', sessionId);
        }
        
        const response = await axios.post('http://localhost:5001/api/chatbot/message', { 
          message: input,
          userId: isAuthenticated && user ? user._id : 'anonymous',
          sessionId: sessionId
        });
        
        setMessages(prev => [...prev, {
          type: 'bot',
          content: response.data.data?.message || response.data.response || "I understand your message. How can I help you?",
          options: response.data.data?.suggestions || ['🔧 Book a Service', '📞 Get Contact Details', '🚗 View Services']
        }]);
      } catch (error) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: "I'm here to help! What would you like to do?",
          options: ['🔧 Book a Service', '📞 Get Contact Details', '🚗 View Services']
        }]);
      } finally {
        setIsLoading(false);
      }
    }
    setInputValue('');
  };

  const validateBookingStep = (step, value) => {
    // Skip validation for steps that are auto-filled for authenticated users
    if (isAuthenticated && user && (step === 1 || step === 2 || step === 3)) {
      return { isValid: true };
    }
    
    switch (step) {
      case 1:
        if (!value || value.length < 2) {
          return { isValid: false, message: '⚠️ Please enter a valid name (at least 2 characters)' };
        }
        break;
      case 2:
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { isValid: false, message: '⚠️ Please enter a valid email address' };
        }
        break;
      case 3:
        if (!value || !/^\+?[\d\s-]{10,}$/.test(value)) {
          return { isValid: false, message: '⚠️ Please enter a valid phone number' };
        }
        break;
      case 4:
        if (!value) {
          return { isValid: false, message: '⚠️ Please select a valid service' };
        }
        break;
      case 5:
        if (!value) {
          return { isValid: false, message: '⚠️ Please select a valid date' };
        }
        break;
      default:
        return { isValid: true };
    }
    return { isValid: true };
  };

  return (
    <>
      <div className="chatbot-container">
        <button 
          className="chat-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? <FaTimes /> : <IoCarSport />}
        </button>

        {isOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <FaRobot className="bot-icon" />
              <span>Car Service Assistant</span>
            </div>

            <div className="messages-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.type}`}
                >
                  <div className="message-content">{message.content}</div>
                  {message.options && message.options.length > 0 && (
                    <div className="message-options">
                      {message.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => handleOptionClick(option)}
                          disabled={isLoading}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading && inputValue.trim()) {
                    handleUserInput(inputValue);
                  }
                }}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button 
                onClick={() => handleUserInput(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="send-button"
                aria-label="Send message"
              >
                {isLoading ? <FaSpinner className="spinner-icon" /> : <FaPaperPlane />}
              </button>
            </div>
          </div>
        )}
      </div>

      <button 
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </button>
    </>
  );
};

export default Chatbot;
