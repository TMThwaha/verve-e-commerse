const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Address = require('../models/Address');
const { authenticate } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
});

// Get user addresses
router.get('/addresses', authenticate, async (req, res) => {
  try {
    let userAddress = await Address.findOne({ user: req.user._id });
    
    if (!userAddress) {
      userAddress = { addresses: [] };
    }

    res.json({ success: true, addresses: userAddress.addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ success: false, message: 'Error fetching addresses' });
  }
});

// Add address
router.post('/addresses', authenticate, async (req, res) => {
  try {
    const addressData = req.body;
    
    let userAddress = await Address.findOne({ user: req.user._id });
    
    if (!userAddress) {
      userAddress = new Address({
        user: req.user._id,
        addresses: [addressData]
      });
    } else {
      userAddress.addresses.push(addressData);
    }

    await userAddress.save();

    res.json({ success: true, addresses: userAddress.addresses });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, message: 'Error adding address' });
  }
});

// Update address
router.put('/addresses/:addressId', authenticate, async (req, res) => {
  try {
    const { addressId } = req.params;
    const addressData = req.body;
    
    const userAddress = await Address.findOne({ user: req.user._id });
    
    if (!userAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const addressIndex = userAddress.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    userAddress.addresses[addressIndex] = { ...userAddress.addresses[addressIndex].toObject(), ...addressData };
    await userAddress.save();

    res.json({ success: true, addresses: userAddress.addresses });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ success: false, message: 'Error updating address' });
  }
});

// Delete address
router.delete('/addresses/:addressId', authenticate, async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const userAddress = await Address.findOne({ user: req.user._id });
    
    if (!userAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    userAddress.addresses = userAddress.addresses.filter(
      addr => addr._id.toString() !== addressId
    );
    
    await userAddress.save();

    res.json({ success: true, addresses: userAddress.addresses });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, message: 'Error deleting address' });
  }
});

module.exports = router;
