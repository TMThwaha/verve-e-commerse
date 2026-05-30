const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');

// Initialize Razorpay
let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
} catch (error) {
  console.error('Razorpay initialization error:', error);
}

// Get Razorpay key
router.get('/razorpay-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Create Razorpay order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Payment gateway not configured' });
    }

    const { amount, orderId } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: uuidv4()
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order with razorpay order id if orderId provided
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        razorpayOrderId: razorpayOrder.id
      });
    }

    res.json({
      success: true,
      order: razorpayOrder
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ success: false, message: 'Error creating payment order' });
  }
});

// Verify payment
router.post('/verify', authenticate, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update order payment status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'Paid',
        razorpayPaymentId: razorpay_payment_id
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Error verifying payment' });
  }
});

// Payment failed
router.post('/failed', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'Failed'
    });

    res.json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    console.error('Payment failed error:', error);
    res.status(500).json({ success: false, message: 'Error updating payment status' });
  }
});

module.exports = router;
