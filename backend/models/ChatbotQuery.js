import mongoose from 'mongoose';

const chatbotQuerySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    enum: ['booking', 'services', 'parts', 'contact', 'hours', 'general', 'car_knowledge', 'maintenance', 'pricing'],
    default: 'general'
  },
  actionTaken: {
    type: Boolean,
    default: false
  },
  actionDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  context: [{
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }],
  feedback: {
    helpful: {
      type: Boolean,
      default: null
    },
    comments: {
      type: String,
      default: ''
    }
  }
});

// Indexes for better query performance
chatbotQuerySchema.index({ sessionId: 1 });
chatbotQuerySchema.index({ userId: 1 });
chatbotQuerySchema.index({ timestamp: -1 });

const ChatbotQuery = mongoose.model('ChatbotQuery', chatbotQuerySchema);

export default ChatbotQuery;
