const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { authenticate, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin credentials (in production, use database)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@verve.com',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Find or create admin user
      let adminUser = await User.findOne({ email, role: 'admin' });
      
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Admin',
          email,
          password,
          role: 'admin',
          isVerified: true
        });
      }

      const { generateTokens } = require('../middleware/auth');
      const { accessToken, refreshToken } = generateTokens(adminUser._id);
      
      adminUser.refreshToken = refreshToken;
      await adminUser.save();

      res.json({
        success: true,
        message: 'Admin login successful',
        user: adminUser,
        accessToken,
        refreshToken
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});

// Dashboard stats
router.get('/dashboard', authenticate, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.find()
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(5)
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard' });
  }
});

// ===== USER MANAGEMENT =====
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find({ role: 'user' }).skip(skip).limit(Number(limit)).sort('-createdAt'),
      User.countDocuments({ role: 'user' })
    ]);

    res.json({
      success: true,
      users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

router.put('/users/:id/block', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: false }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error blocking user' });
  }
});

router.put('/users/:id/unblock', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: true }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error unblocking user' });
  }
});

// ===== PRODUCT MANAGEMENT =====
router.get('/products', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find()
        .populate('category', 'name')
        .populate('brand', 'name')
        .skip(skip)
        .limit(Number(limit))
        .sort('-createdAt'),
      Product.countDocuments()
    ]);

    res.json({
      success: true,
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

router.post('/products', authenticate, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, category, brand, price, stock } = req.body;
    const images = req.files.map(file => file.filename);

    const product = await Product.create({
      name,
      description,
      category,
      brand,
      price: Number(price),
      stock: Number(stock),
      images
    });

    res.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Error creating product' });
  }
});

router.put('/products/:id', authenticate, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, category, brand, price, stock } = req.body;
    const updateData = { name, description, category, brand, price: Number(price), stock: Number(stock) };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.filename);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('category', 'name')
      .populate('brand', 'name');

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
});

router.put('/products/:id/block', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: false }, { new: true });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error blocking product' });
  }
});

router.put('/products/:id/unblock', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: true }, { new: true });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error unblocking product' });
  }
});

// ===== CATEGORY MANAGEMENT =====
router.get('/categories', authenticate, isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort('-createdAt');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
});

router.post('/categories', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Category.findOne({ name: name.toUpperCase() });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name: name.toUpperCase(), description });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating category' });
  }
});

router.put('/categories/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name.toUpperCase(), description },
      { new: true }
    );
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating category' });
  }
});

router.put('/categories/:id/toggle', authenticate, isAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    category.status = !category.status;
    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling category' });
  }
});

// ===== BRAND MANAGEMENT =====
router.get('/brands', authenticate, isAdmin, async (req, res) => {
  try {
    const brands = await Brand.find().sort('-createdAt');
    res.json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching brands' });
  }
});

router.post('/brands', authenticate, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await Brand.create({ name });
    res.json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating brand' });
  }
});

router.put('/brands/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await Brand.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating brand' });
  }
});

router.put('/brands/:id/toggle', authenticate, isAdmin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    brand.status = !brand.status;
    await brand.save();
    res.json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling brand' });
  }
});

// ===== ORDER MANAGEMENT =====
router.get('/orders', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = status ? { status } : {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('products.product', 'name images')
        .skip(skip)
        .limit(Number(limit))
        .sort('-createdAt'),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

router.put('/orders/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order status' });
  }
});

// ===== COUPON MANAGEMENT =====
router.get('/coupons', authenticate, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching coupons' });
  }
});

router.post('/coupons', authenticate, isAdmin, async (req, res) => {
  try {
    const { code, minPurchaseAmount, discountAmount, startDate, expiryDate } = req.body;
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      minPurchaseAmount,
      discountAmount,
      startDate,
      expiryDate
    });
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating coupon' });
  }
});

router.put('/coupons/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { code, minPurchaseAmount, discountAmount, startDate, expiryDate } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { code: code.toUpperCase(), minPurchaseAmount, discountAmount, startDate, expiryDate },
      { new: true }
    );
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating coupon' });
  }
});

router.delete('/coupons/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting coupon' });
  }
});

module.exports = router;
