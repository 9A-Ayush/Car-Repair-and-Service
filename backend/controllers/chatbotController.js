import ChatbotQuery from '../models/ChatbotQuery.js';
import Appointment from '../models/Appointment.js';
import { getAIResponse } from '../utils/deepseekHelper.js';
import mongoose from 'mongoose';
import { sendBookingEmail } from '../utils/notifications.js';
import { carKnowledge } from '../data/carKnowledge.js';
import { errorResponse, successResponse } from '../utils/response.js';

// Enhanced intent detection with more car-related categories
const determineIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
    return 'booking';
  } else if (lowerMessage.includes('service') || lowerMessage.includes('maintenance') || lowerMessage.includes('repair')) {
    return 'services';
  } else if (lowerMessage.includes('spare') || lowerMessage.includes('parts') || lowerMessage.includes('part')) {
    return 'parts';
  } else if (lowerMessage.includes('contact') || lowerMessage.includes('location') || lowerMessage.includes('reach') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
    return 'contact';
  } else if (lowerMessage.includes('hour') || lowerMessage.includes('time') || lowerMessage.includes('open')) {
    return 'hours';
  } else if (lowerMessage.includes('oil') || lowerMessage.includes('brake') || lowerMessage.includes('tire') || lowerMessage.includes('filter')) {
    return 'maintenance';
  } else if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('fee') || lowerMessage.includes('charge')) {
    return 'pricing';
  } else if (lowerMessage.includes('engine') || lowerMessage.includes('transmission') || lowerMessage.includes('battery') || 
             lowerMessage.includes('check engine') || lowerMessage.includes('noise') || lowerMessage.includes('problem')) {
    return 'car_knowledge';
  } else {
    return 'general';
  }
};

// Input validation functions
const validateQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return { isValid: false, message: 'Query must be a non-empty string' };
  }
  if (query.length > 500) {
    return { isValid: false, message: 'Query must not exceed 500 characters' };
  }
  return { isValid: true };
};

const validateBookingData = (data) => {
  const errors = [];
  
  if (!data.customerName || data.customerName.length < 2) {
    errors.push('Customer name must be at least 2 characters long');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.phoneNumber || !/^\+?[\d\s-]{10,}$/.test(data.phoneNumber)) {
    errors.push('Please enter a valid phone number');
  }
  
  if (!data.service) {
    errors.push('Service type is required');
  }
  
  if (!data.date) {
    errors.push('Date is required');
  }
  
  if (!data.time) {
    errors.push('Time is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Process chatbot queries with enhanced context handling
export const processChatbotQuery = async (req, res) => {
  try {
    const { query, context = [], userId = null, sessionId = null } = req.body;
    
    // Validate query
    const queryValidation = validateQuery(query);
    if (!queryValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: queryValidation.message 
      });
    }

    // Validate context array
    if (!Array.isArray(context)) {
      return res.status(400).json({
        success: false,
        message: 'Context must be an array'
      });
    }

    // Validate each context item
    for (const item of context) {
      if (!item.role || !['system', 'user', 'assistant'].includes(item.role) || !item.content) {
        return res.status(400).json({
          success: false,
          message: 'Invalid context format'
        });
      }
    }

    // Determine intent for better response targeting
    const intent = determineIntent(query);
    
    // Get AI response with context
    const aiResponse = await getAIResponse(query, context);
    
    // Generate appropriate options based on intent and AI response
    let options = getOptionsForIntent(intent, aiResponse);

    // Save the conversation for future context
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = new mongoose.Types.ObjectId().toString();
    }

    if (currentSessionId) {
      try {
        const conversationData = {
          userId: userId || 'anonymous',
          sessionId: currentSessionId,
          query,
          response: aiResponse,
          intent,
          context: [
            ...context,
            { role: 'user', content: query },
            { role: 'assistant', content: aiResponse }
          ]
        };

        // Use create instead of saveConversation
        await ChatbotQuery.create(conversationData);
      } catch (dbError) {
        console.error('Error saving conversation:', dbError);
        // Continue even if saving fails
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        options: options,
        intent,
        sessionId: currentSessionId,
        clearInputs: true
      }
    });

  } catch (error) {
    console.error('Chatbot processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: error.message
    });
  }
};

// Enhanced options based on intent with more car-specific options
const getOptionsForIntent = (intent, aiResponse) => {
  const defaultOptions = [
    'Book a Service',
    'View Services',
    'Check Spare Parts',
    'Contact Information',
    'Operating Hours'
  ];

  switch (intent) {
    case 'booking':
      return [
        'Schedule Oil Change',
        'Schedule Brake Service',
        'Schedule Tire Rotation',
        'Schedule Full Inspection',
        'Check Available Slots'
      ];
    case 'services':
      return [
        'Oil Change Service - $49.99',
        'Brake Service - $129.99',
        'Tire Rotation - $39.99',
        'Full Inspection - $89.99',
        'Book a Service Now'
      ];
    case 'parts':
      return [
        'Check Parts Availability',
        'View Parts Catalog',
        'Request Specific Part',
        'Parts Warranty Information'
      ];
    case 'contact':
      return [
        'Call the Shop',
        'Send Email',
        'Get Directions',
        'Business Hours'
      ];
    case 'hours':
      return [
        'Book for Today',
        'Book for Tomorrow',
        'View Full Schedule'
      ];
    case 'maintenance':
      return [
        'Oil Change Information',
        'Brake Service Details',
        'Tire Care Tips',
        'Recommended Maintenance Schedule'
      ];
    case 'car_knowledge':
      return [
        'Common Engine Problems',
        'Transmission Issues',
        'Battery Troubleshooting',
        'Check Engine Light Information'
      ];
    case 'pricing':
      return [
        'Service Package Pricing',
        'Request Quote',
        'Payment Options',
        'Discounts & Promotions'
      ];
    default:
      return defaultOptions;
  }
};

// Process specific actions with enhanced car service options
export const processAction = async (req, res) => {
  try {
    const { action, details } = req.body;
    
    // Validate action
    if (!action || typeof action !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Action is required and must be a string'
      });
    }

    // Validate booking data if present
    if (action === 'Book a Service' && details) {
      const bookingValidation = validateBookingData(details);
      if (!bookingValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking data',
          errors: bookingValidation.errors
        });
      }
    }
    
    switch (action) {
      case 'Get Time Slots':
        // Enhanced with real slot availability logic
        const date = details?.date || new Date().toISOString().split('T')[0];
        const availableSlots = await getAvailableTimeSlots(date);
        
        return res.status(200).json({
          success: true,
          data: {
            slots: availableSlots,
            response: "Here are our available time slots. Please select your preferred time:",
            options: availableSlots.length > 0 ? availableSlots.map(slot => slot.time) : ['No slots available, try another date'],
            clearInputs: true
          }
        });

      case 'Book a Service':
        return res.status(200).json({
          success: true,
          data: {
            response: "Let's book your service. What type of service do you need?",
            options: [
              'Oil Change Service',
              'Brake Service',
              'Tire Rotation',
              'Full Car Inspection',
              'General Maintenance'
            ]
          }
        });

      case 'Car Troubleshooting':
        return res.status(200).json({
          success: true,
          data: {
            response: "I can help diagnose common car issues. What symptoms are you experiencing?",
            options: [
              'Engine making noise',
              'Car cannot start',
              'Check engine light is on',
              'Transmission problems'
            ]
          }
        });

      case 'Maintenance Schedule':
        return res.status(200).json({
          success: true,
          data: {
            response: "Regular maintenance keeps your car running smoothly. What's your current mileage?",
            options: [
              'Under 30,000 miles',
              '30,000-60,000 miles',
              '60,000-90,000 miles',
              'Over 90,000 miles'
            ]
          }
        });

      case 'Contact Information':
        return res.status(200).json({
          success: true,
          data: {
            response: "You can reach Car Cure at:\n\nPhone: (555) 123-4567\nEmail: service@carcure.com\nAddress: 123 Auto Lane, Cartown, CT 12345\n\nHow would you like to contact us?",
            options: [
              'Call Now',
              'Send Email',
              'Get Directions',
              'Return to Main Menu'
            ]
          }
        });

      default:
        return res.status(200).json({
          success: true,
          data: {
            response: "I'm not sure how to process that action. Can I help you with something else?",
            options: [
              'Book a Service',
              'Car Troubleshooting',
              'Maintenance Information',
              'Contact Information'
            ]
          }
        });
    }
  } catch (error) {
    console.error('Action processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing the action',
      error: error.message
    });
  }
};

// Helper function to get available time slots
async function getAvailableTimeSlots(date) {
  try {
    // Get all appointments for the specified date
    const bookedAppointments = await Appointment.find({
      date: new Date(date),
      status: { $ne: 'cancelled' }
    }).select('time');
    
    // Define all possible time slots
    const allTimeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];
    
    // Filter out booked slots
    const bookedTimes = bookedAppointments.map(appt => appt.time);
    const availableSlots = allTimeSlots
      .filter(time => !bookedTimes.includes(time))
      .map(time => ({ time, available: true }));
    
    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
}

// Enhanced booking appointment function with validation
export const bookAppointment = async (req, res) => {
  try {
    const { customerName, email, phoneNumber, service, date, time, message } = req.body;

    // Validate required fields
    if (!customerName || !email || !phoneNumber || !service || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate phone number (simple validation)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[-()\s]/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    // Check if the slot is available
    const isSlotAvailable = await checkSlotAvailability(date, time);
    if (!isSlotAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is no longer available. Please select another time.'
      });
    }

    // Create new appointment with all required fields
    const appointment = new Appointment({
      customerName,
      email,
      phoneNumber,
      service,
      date: new Date(date),
      time,
      message: message || '',
      status: 'confirmed',
      source: 'chatbot'
    });

    // Save with error handling and logging
    console.log('Attempting to save appointment:', {
      customerName,
      email,
      phoneNumber,
      service,
      date,
      time
    });
    
    const savedAppointment = await appointment.save();
    
    if (!savedAppointment) {
      throw new Error('Failed to save appointment to database');
    }

    console.log('Appointment saved successfully:', savedAppointment._id);

    return res.status(201).json({
      success: true,
      data: {
        appointment: savedAppointment,
        response: `Great! Your ${service} appointment has been confirmed for ${new Date(date).toLocaleDateString()} at ${time}. We've sent a confirmation to ${email}. Is there anything else you need help with?`,
        options: [
          'Add to Calendar',
          'View Appointment Details',
          'Book Another Service',
          'Return to Main Menu'
        ],
        clearInputs: true
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
};

// Add a new endpoint to handle booking confirmations
export const confirmBooking = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }
    
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    appointment.status = 'confirmed';
    await appointment.save();
    
    return res.status(200).json({
      success: true,
      data: {
        appointment,
        response: `Your ${appointment.service} appointment has been confirmed for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}. We look forward to seeing you!`,
        options: [
          'Add to Calendar',
          'View Appointment Details',
          'Book Another Service',
          'Return to Main Menu'
        ]
      }
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
      error: error.message
    });
  }
};

// Get car information and maintenance tips
export const getCarInfo = async (req, res) => {
  try {
    const { make, model, year, issue } = req.body;
    
    // Create a prompt for the AI based on the car details
    let prompt = "I need information about ";
    
    if (make) prompt += `${make} `;
    if (model) prompt += `${model} `;
    if (year) prompt += `${year} `;
    if (issue) prompt += `with the following issue: ${issue}`;
    else prompt += "maintenance and common issues";
    
    // Get AI response
    const aiResponse = await getAIResponse(prompt);
    
    // Determine appropriate options based on the issue
    let options = [];
    
    if (issue?.toLowerCase().includes('engine')) {
      options = [
        'Book Engine Diagnostic',
        'Engine Maintenance Tips',
        'Common Engine Problems',
        'DIY Troubleshooting'
      ];
    } else if (issue?.toLowerCase().includes('brake')) {
      options = [
        'Book Brake Service',
        'Brake Maintenance Tips',
        'Signs of Brake Problems',
        'Brake Service Pricing'
      ];
    } else if (issue?.toLowerCase().includes('tire') || issue?.toLowerCase().includes('wheel')) {
      options = [
        'Book Tire Service',
        'Tire Rotation Information',
        'Tire Pressure Tips',
        'Wheel Alignment Info'
      ];
    } else {
      options = [
        'Book a Service',
        'Maintenance Schedule',
        'DIY Maintenance Tips',
        'Contact a Mechanic'
      ];
    }
    
    return res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        options
      }
    });
  } catch (error) {
    console.error('Car info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get car information',
      error: error.message
    });
  }
};

// Provide feedback on chatbot responses
export const provideFeedback = async (req, res) => {
  try {
    const { sessionId, messageId, helpful, comments } = req.body;
    
    if (!sessionId || !messageId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message ID are required'
      });
    }
    
    // Find the chatbot query and update feedback
    const chatbotQuery = await ChatbotQuery.findById(messageId);
    
    if (!chatbotQuery) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Update feedback
    chatbotQuery.feedback = {
      helpful: helpful,
      comments: comments || ''
    };
    
    await chatbotQuery.save();
    
    return res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
};

// Get chat history with enhanced filtering
export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId, limit = 20, skip = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Build query
    const query = { userId };
    if (sessionId) query.sessionId = sessionId;

    // Get history with pagination
    const history = await ChatbotQuery.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await ChatbotQuery.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: total > (parseInt(skip) + parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('History error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
      error: error.message
    });
  }
};

// Add car knowledge base for common questions
const carKnowledgeBase = {
  oilChange: {
    interval: 'Every 3,000-5,000 miles for conventional oil, or 7,500-10,000 miles for synthetic oil',
    signs: 'Dark, dirty oil, engine noise, dashboard warning lights',
    importance: 'Prevents engine wear, improves fuel efficiency, extends engine life'
  },
  brakes: {
    warning: 'Squeaking/grinding noises, soft/spongy pedal feel, longer stopping distance, vibration when braking',
    maintenance: 'Inspect every 10,000-15,000 miles, replace pads every 30,000-70,000 miles depending on driving habits'
  },
  tires: {
    pressure: "Check monthly, proper PSI listed on driver's door jamb",
    rotation: 'Every 5,000-8,000 miles to ensure even wear',
    replacement: 'When tread depth reaches 2/32 inch, or every 6 years regardless of tread'
  },
  battery: {
    lifespan: 'Typically 3-5 years',
    signs: 'Slow engine crank, dim lights, electrical issues, swollen battery case'
  },
  checkEngine: {
    response: 'The check engine light can indicate various issues from minor (loose gas cap) to serious (catalytic converter failure). It\'s best to get a diagnostic scan.'
  }
};

// Helper function to check if appointment slot is available
async function checkSlotAvailability(date, time) {
  try {
    const existingAppointment = await Appointment.findOne({
      date: new Date(date),
      time,
      status: { $ne: 'cancelled' }
    });
    
    return !existingAppointment; // Return true if no appointment exists (slot is available)
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false; // Default to unavailable if there's an error
  }
}

// Process maintenance recommendations based on vehicle information
export const getMaintenanceRecommendations = async (req, res) => {
  try {
    const { make, model, year, mileage } = req.body;
    
    if (!mileage) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle mileage is required for maintenance recommendations'
      });
    }
    
    // Create a prompt for maintenance recommendations
    let prompt = `Provide maintenance recommendations for a ${year || ''} ${make || ''} ${model || ''} with ${mileage} miles.`;
    
    // Get AI response
    const aiResponse = await getAIResponse(prompt);
    
    // Determine appropriate maintenance options based on mileage
    let options = [];
    const mileageNum = parseInt(mileage.replace(/,/g, ''));
    
    if (mileageNum < 30000) {
      options = [
        'Oil Change Service',
        'Tire Rotation',
        'Basic Inspection',
        'Book Recommended Service'
      ];
    } else if (mileageNum < 60000) {
      options = [
        'Brake Inspection',
        'Transmission Service',
        'Cooling System Check',
        'Book 30K Mile Service'
      ];
    } else if (mileageNum < 90000) {
      options = [
        'Timing Belt Service',
        'Fuel System Cleaning',
        'Suspension Check',
        'Book 60K Mile Service'
      ];
    } else {
      options = [
        'Major Service Package',
        'Engine Performance Check',
        'Complete Vehicle Inspection',
        'Book 90K+ Mile Service'
      ];
    }
    
    return res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        options,
        mileage: mileageNum
      }
    });
  } catch (error) {
    console.error('Maintenance recommendations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get maintenance recommendations',
      error: error.message
    });
  }
};

// Train chatbot with new data
export const trainChatbot = async (req, res) => {
  try {
    const { category, data } = req.body;
    
    if (!category || !data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid training data format'
      });
    }
    
    // Store training data in database for future use
    const trainingResults = await Promise.all(
      data.map(async (item) => {
        // Create a new document for each training example
        const trainingExample = new ChatbotQuery({
          query: item.query,
          response: item.response,
          intent: category,
          context: [
            { role: 'user', content: item.query },
            { role: 'assistant', content: item.response }
          ],
          actionTaken: false,
          timestamp: new Date(),
          isTrainingData: true // Mark as training data
        });
        
        return trainingExample.save();
      })
    );
    
    console.log(`Added ${trainingResults.length} training examples for category: ${category}`);
    
    return res.status(200).json({
      success: true,
      message: `Successfully trained chatbot with ${trainingResults.length} examples for ${category}`,
      count: trainingResults.length
    });
  } catch (error) {
    console.error('Error training chatbot:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to train chatbot',
      error: error.message
    });
  }
};

// Get service status by booking reference
export const getServiceStatus = async (req, res) => {
  try {
    const { bookingRef } = req.params;

    const appointment = await Appointment.findOne({ bookingRef });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'No booking found with this reference number'
      });
    }

    // Format the response
    const status = {
      bookingRef: appointment.bookingRef,
      customerName: appointment.customerName,
      service: appointment.service,
      date: new Date(appointment.date).toLocaleDateString(),
      time: appointment.time,
      status: appointment.status,
      message: getStatusMessage(appointment.status)
    };

    res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error in getServiceStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service status',
      error: error.message
    });
  }
};

// Book a service
export const bookService = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phoneNumber,
      service,
      date,
      time,
      message
    } = req.body;

    // Validate date and time
    const selectedDate = new Date(date);
    const today = new Date();
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Please select a future date'
      });
    }

    // Generate booking reference
    const bookingRef = generateBookingRef();

    // Create appointment
    const appointment = new Appointment({
      bookingRef,
      customerName,
      email,
      phoneNumber,
      service,
      date,
      time,
      message,
      status: 'pending'
    });

    await appointment.save();

    // Send confirmation email
    try {
      await sendBookingConfirmation(appointment);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Service booked successfully',
      bookingRef,
      appointment
    });
  } catch (error) {
    console.error('Error in bookService:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book service',
      error: error.message
    });
  }
};

// Helper function to generate booking reference
const generateBookingRef = () => {
  const prefix = 'SVC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Helper function to get status message
const getStatusMessage = (status) => {
  switch (status) {
    case 'pending':
      return 'Your service is scheduled and pending.';
    case 'confirmed':
      return 'Your service has been confirmed. Please bring your vehicle at the scheduled time.';
    case 'in-progress':
      return 'Your vehicle is currently being serviced by our technicians.';
    case 'completed':
      return 'Your service has been completed. You can collect your vehicle.';
    case 'cancelled':
      return 'This service booking has been cancelled.';
    default:
      return 'Status information not available.';
  }
};

// Send booking confirmation email
const sendBookingConfirmation = async (booking) => {
  const emailTemplate = `
    <h2>Service Booking Confirmation</h2>
    <p>Dear ${booking.customerName},</p>
    <p>Your car service booking has been confirmed. Here are the details:</p>
    <ul>
      <li><strong>Booking Reference:</strong> ${booking.bookingRef}</li>
      <li><strong>Service:</strong> ${booking.service}</li>
      <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
      <li><strong>Time:</strong> ${booking.time}</li>
    </ul>
    <p>Please note:</p>
    <ul>
      <li>Arrive 10 minutes before your scheduled time</li>
      <li>Bring your vehicle registration documents</li>
      <li>Keep this booking reference for future reference</li>
    </ul>
    <p>You can check your service status anytime using your booking reference number.</p>
    <p>If you need to make any changes, please contact us at:</p>
    <p>📞 Phone: +919472548097<br>
    📧 Email: service@carservice.com</p>
    <p>Thank you for choosing our service!</p>
  `;

  await sendBookingEmail({
    email: booking.email,
    subject: 'Car Service Booking Confirmation',
    html: emailTemplate
  });
};

// Process user message and return appropriate response
export const processMessage = async (req, res) => {
    try {
        const { message, userId = 'anonymous', sessionId = null } = req.body;

        if (!message) {
            return errorResponse(res, 'Message is required');
        }

        // Generate a session ID if not provided
        const currentSessionId = sessionId || new mongoose.Types.ObjectId().toString();

        // Convert message to lowercase for better matching
        const query = message.toLowerCase();

        // Find relevant information from car knowledge base
        const responses = [];
        
        // Search through car knowledge
        for (const category in carKnowledge) {
            const categoryData = carKnowledge[category];
            
            // Check if query matches any keywords in the category
            const isRelevant = categoryData.keywords.some(keyword => 
                query.includes(keyword.toLowerCase())
            );

            if (isRelevant) {
                responses.push({
                    category,
                    ...categoryData
                });
            }
        }

        // Prepare response data
        let responseData;
        
        // If no specific matches found, provide general response
        if (responses.length === 0) {
            responseData = {
                message: 'I can help you with car maintenance, repairs, and services. You can ask me about:',
                suggestions: [
                    'Common car problems',
                    'Maintenance tips',
                    'Service intervals',
                    'Cost estimates',
                    'DIY repairs'
                ]
            };
        } else {
            // Return the most relevant response
            const bestMatch = responses[0];
            responseData = {
                category: bestMatch.category,
                message: bestMatch.description,
                tips: bestMatch.tips || [],
                warnings: bestMatch.warnings || [],
                estimatedCost: bestMatch.estimatedCost || 'Varies based on vehicle',
                recommendedAction: bestMatch.recommendedAction || 'Consult with our service center'
            };
        }

        // Determine intent for categorization
        const intent = determineIntent(message);

        // Store the conversation in the database
        try {
            await ChatbotQuery.create({
                userId: userId,
                sessionId: currentSessionId,
                query: message,
                response: responseData.message,
                intent: intent,
                context: [
                    { role: 'user', content: message },
                    { role: 'assistant', content: responseData.message }
                ],
                actionTaken: false,
                timestamp: new Date()
            });
        } catch (dbError) {
            console.error('Error saving chatbot conversation:', dbError);
            // Continue even if saving fails
        }

        return successResponse(res, 'Chatbot response', {
            ...responseData,
            sessionId: currentSessionId
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        return errorResponse(res, 'Failed to process message');
    }
};

// Get chatbot suggestions
export const getSuggestions = async (req, res) => {
    try {
        const suggestions = [
            'What are common brake problems?',
            'How often should I change my oil?',
            'What causes engine overheating?',
            'How to maintain my car battery?',
            'What are signs of transmission issues?'
        ];

        return successResponse(res, 'Chatbot suggestions', { suggestions });
    } catch (error) {
        console.error('Get suggestions error:', error);
        return errorResponse(res, 'Failed to get suggestions');
    }
};

// Book a service appointment
export const bookServiceAppointment = async (req, res) => {
    try {
        const { name, email, phone, service, date, time, vehicleDetails, message, userId = 'anonymous', sessionId = null } = req.body;
        
        if (!name || !email || !service || !date || !time || !vehicleDetails) {
            return errorResponse(res, 'Please provide all required booking information');
        }
        
        // Generate a session ID if not provided
        const currentSessionId = sessionId || new mongoose.Types.ObjectId().toString();
        
        // Here you would typically save this to a database
        // For now, we'll just send a confirmation email
        
        const emailSubject = 'Car Service Booking Confirmation';
        const emailText = `
Dear ${name},

Thank you for booking a service with us. Here are your booking details:

Service: ${service}
Date: ${date}
Time: ${time}
Vehicle: ${vehicleDetails}
${message ? `Additional notes: ${message}` : ''}

We'll contact you shortly to confirm your appointment.

Best regards,
Car Service Team
        `;
        
        await sendEmail(email, emailSubject, emailText);
        
        const bookingReference = `SVC-${Date.now().toString().substring(5)}`;
        
        // Store the booking conversation in the ChatbotQuery collection
        try {
            const userQuery = `Book a ${service} service on ${date} at ${time}`;
            const botResponse = `Thank you for your booking. Your reference number is ${bookingReference}.`;
            
            await ChatbotQuery.create({
                userId: userId,
                sessionId: currentSessionId,
                query: userQuery,
                response: botResponse,
                intent: 'booking',
                context: [
                    { role: 'user', content: userQuery },
                    { role: 'assistant', content: botResponse }
                ],
                actionTaken: true,
                actionDetails: {
                    bookingReference,
                    service,
                    date,
                    time,
                    vehicleDetails
                },
                timestamp: new Date()
            });
        } catch (dbError) {
            console.error('Error saving booking conversation:', dbError);
            // Continue even if saving fails
        }
        
        return successResponse(res, 'Service booking received', {
            bookingReference,
            message: 'Thank you for your booking. We will contact you shortly to confirm.',
            sessionId: currentSessionId
        });
    } catch (error) {
        console.error('Service booking error:', error);
        return errorResponse(res, 'Failed to process service booking');
    }
};

// Get service status
export const getServiceStatusInfo = async (req, res) => {
    try {
        const { bookingRef } = req.params;
        const { userId = 'anonymous', sessionId = null } = req.body;
        
        if (!bookingRef) {
            return errorResponse(res, 'Booking reference is required');
        }
        
        // Generate a session ID if not provided
        const currentSessionId = sessionId || new mongoose.Types.ObjectId().toString();
        
        // In a real application, you would look up the status in a database
        // For demo purposes, we'll return a mock status
        
        const statusData = {
            bookingReference: bookingRef,
            status: 'in-progress',
            updates: [
                { timestamp: new Date(Date.now() - 86400000).toISOString(), message: 'Booking received' },
                { timestamp: new Date(Date.now() - 43200000).toISOString(), message: 'Vehicle inspection started' },
                { timestamp: new Date().toISOString(), message: 'Service in progress' }
            ],
            estimatedCompletion: new Date(Date.now() + 7200000).toISOString()
        };
        
        // Store the status check conversation in the ChatbotQuery collection
        try {
            const userQuery = `Check status of booking ${bookingRef}`;
            const botResponse = `Your booking ${bookingRef} is ${statusData.status}. Estimated completion: ${new Date(statusData.estimatedCompletion).toLocaleString()}`;
            
            await ChatbotQuery.create({
                userId: userId,
                sessionId: currentSessionId,
                query: userQuery,
                response: botResponse,
                intent: 'service_status',
                context: [
                    { role: 'user', content: userQuery },
                    { role: 'assistant', content: botResponse }
                ],
                actionTaken: true,
                actionDetails: statusData,
                timestamp: new Date()
            });
        } catch (dbError) {
            console.error('Error saving status check conversation:', dbError);
            // Continue even if saving fails
        }
        
        return successResponse(res, 'Service status retrieved', {
            ...statusData,
            sessionId: currentSessionId
        });
    } catch (error) {
        console.error('Get service status error:', error);
        return errorResponse(res, 'Failed to retrieve service status');
    }
};
