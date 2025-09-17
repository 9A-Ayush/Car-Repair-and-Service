import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  service: {
    type: String,
    required: true,
    enum: [
      'Regular Maintenance',
      'Engine Repair',
      'Brake Service',
      'Oil Change',
      'Tire Service',
      'AC Service',
      'Other'
    ]
  },
  vehicleDetails: {
    make: {
      type: String,
      required: false,
      default: 'Not Specified',
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: String,
      required: true,
      trim: true
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    }
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:mm`
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: {
    type: Number,
    min: 0
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  completedAt: {
    type: Date
  },
  bookingRef: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
appointmentSchema.pre('save', async function(next) {
  if (!this.bookingRef) {
    const count = await mongoose.model('Appointment').countDocuments();
    const date = new Date();
    this.bookingRef = `APT${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Create indexes for better query performance
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;