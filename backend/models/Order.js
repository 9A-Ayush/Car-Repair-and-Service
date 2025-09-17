import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [
      {
        validator: function(items) {
          return items && items.length > 0;
        },
        message: 'Order must have at least one item'
      }
    ]
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { 
  timestamps: true 
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    this.orderNumber = `ORD-${timestamp}-${randomNum}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
