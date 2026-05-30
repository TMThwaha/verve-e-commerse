const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Address = require('../models/Address');
const Coupon = require('../models/Coupon');
const { authenticate } = require('../middleware/auth');

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .populate('products.product', 'name images price')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

// Get single order
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    }).populate('products.product', 'name images price');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Error fetching order' });
  }
});

// Place order
router.post('/place', authenticate, async (req, res) => {
  try {
    const { addressId, paymentMethod, couponCode } = req.body;

    if (!addressId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Address and payment method are required' });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Verify stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`
        });
      }
    }

    // Get address
    const userAddress = await Address.findOne({ user: req.user._id });
    const selectedAddress = userAddress?.addresses.find(
      addr => addr._id.toString() === addressId
    );

    if (!selectedAddress) {
      return res.status(400).json({ success: false, message: 'Invalid address' });
    }

    // Calculate total
    let totalAmount = cart.items.reduce(
      (acc, item) => acc + (item.price * item.quantity),
      0
    );

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        status: true,
        expiryDate: { $gt: new Date() }
      });

      if (coupon && totalAmount >= coupon.minPurchaseAmount) {
        totalAmount -= coupon.discountAmount;
        if (totalAmount < 0) totalAmount = 0;
      }
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      address: {
        name: selectedAddress.name,
        phoneNumber: selectedAddress.number,
        address: selectedAddress.address,
        locality: selectedAddress.locality,
        pincode: selectedAddress.pincode,
        city: selectedAddress.city,
        state: selectedAddress.state,
        addressType: selectedAddress.addressType
      },
      products: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        status: 'pending'
      })),
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Pending'
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ success: false, message: 'Error placing order' });
  }
});

// Cancel order
router.put('/:orderId/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['Pending', 'Order Confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
    }

    order.status = 'canceled';
    order.products.forEach(p => p.status = 'canceled');
    await order.save();

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Error cancelling order' });
  }
});

// Apply coupon
router.post('/apply-coupon', authenticate, async (req, res) => {
  try {
    const { couponCode, totalAmount } = req.body;

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      status: true,
      startDate: { $lte: new Date() },
      expiryDate: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
    }

    if (totalAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount is ${coupon.minPurchaseAmount}`
      });
    }

    if (coupon.usedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Coupon already used' });
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        minPurchaseAmount: coupon.minPurchaseAmount
      }
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ success: false, message: 'Error applying coupon' });
  }
});

module.exports = router;
