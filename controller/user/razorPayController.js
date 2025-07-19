const Razorpay = require('razorpay');
const uuid = require('uuid');
const orderModel = require('../../model/orderModel');

// Debug logs before initializing Razorpay
console.log('RAZORPAY_KEY_ID in controller:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET in controller:', process.env.RAZORPAY_KEY_SECRET);

// Check for valid keys before creating Razorpay instance
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Error: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined');
  throw new Error('Razorpay credentials are missing');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = {
  razorKey: (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
  },
  RazorOrder: async (req, res) => {
    console.log('Received request at /razor-order');
    console.log('Request body:', req.body);
    console.log('.........razoreOrder............................ Before........', req.session.Amount);
    try {
      const { amount } = req.body;
      console.log('req.body amount:', amount);

      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Invalid amount provided' });
      }

      const options = {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: uuid.v4(),
      };

      const order = await razorpay.orders.create(options);
      console.log('Razorpay order created:', order);
      res.json({ order });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};