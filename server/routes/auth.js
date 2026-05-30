const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateTokens, authenticate, verifyRefreshToken, JWT_SECRET } = require('../middleware/auth');
const generateOTP = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store user details and OTP temporarily
    otpStore.set(email, {
      name,
      email,
      password,
      otp,
      expiresAt: Date.now() + 2 * 60 * 1000 // 2 minutes
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: 'OTP sent to your email', email });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Create user
    const user = await User.create({
      name: storedData.name,
      email: storedData.email,
      password: storedData.password,
      isVerified: true
    });

    // Clean up
    otpStore.delete(email);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Registration successful',
      user,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Error verifying OTP' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ success: false, message: 'Registration session expired. Please register again.' });
    }

    // Generate new OTP
    const otp = generateOTP();
    storedData.otp = otp;
    storedData.expiresAt = Date.now() + 2 * 60 * 1000;
    otpStore.set(email, storedData);

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Error resending OTP' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.status) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      user,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const user = await verifyRefreshToken(refreshToken);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Error refreshing token' });
  }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Error logging out' });
  }
});

// Get current user
router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// Google OAuth callback
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    try {
      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
      }

      const { accessToken, refreshToken } = generateTokens(user._id);
      
      user.refreshToken = refreshToken;
      await user.save();

      // Redirect to frontend with tokens
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  })(req, res, next);
});

module.exports = router;
