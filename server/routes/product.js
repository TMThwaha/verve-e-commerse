const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { optionalAuth } = require('../middleware/auth');

// Get all products with filtering, sorting, pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      status = 'true'
    } = req.query;

    const query = {};

    // Only show active products for regular users
    if (status === 'true') {
      query.status = true;
    }

    // Category filter
    if (category) {
      const cat = await Category.findOne({ name: category.toUpperCase() });
      if (cat) query.category = cat._id;
    }

    // Brand filter
    if (brand) {
      const br = await Brand.findOne({ name: brand });
      if (br) query.brand = br._id;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .populate('brand', 'name')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('brand', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Error fetching product' });
  }
});

// Get all categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Category.find({ status: true });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
});

// Get all brands
router.get('/meta/brands', async (req, res) => {
  try {
    const brands = await Brand.find({ status: true });
    res.json({ success: true, brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ success: false, message: 'Error fetching brands' });
  }
});

// Get featured/latest products
router.get('/featured/latest', async (req, res) => {
  try {
    const products = await Product.find({ status: true })
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort('-createdAt')
      .limit(8);

    res.json({ success: true, products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ success: false, message: 'Error fetching featured products' });
  }
});

module.exports = router;
