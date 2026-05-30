const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String },
  address: { type: String, required: true },
  locality: { type: String, required: true },
  pincode: { type: Number, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  addressType: {
    type: String,
    enum: ['HOME', 'WORK', 'OTHER'],
    default: 'HOME'
  }
});

const orderProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'Order Confirmed',
      'Order Shipped',
      'Order Delivered',
      'Order Rejected',
      'canceled',
      'Return Requested',
      'Return Approved',
      'Return Rejected',
      'Returned'
    ],
    default: 'pending'
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: Number,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: addressSchema,
  deliveryDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  products: [orderProductSchema],
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash on Delivery', 'Razor Pay', 'Wallet']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Pending', 'Order Confirmed', 'Order Shipped', 'Order Delivered', 'canceled'],
    default: 'Pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String
}, {
  timestamps: true
});

// Auto-generate order ID
orderSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  try {
    const Counter = require('./Counter');
    const counter = await Counter.findOneAndUpdate(
      { model: 'Order', field: 'orderId' },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    this.orderId = counter.count + 1000;
    next();
  } catch (error) {
    next(error);
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
