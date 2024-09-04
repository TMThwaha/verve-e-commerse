const router = require('express').Router();
const authController = require('../controller/user/authController');

// Route for successful login
router.get('/login/success', authController.loginSuccess);

// Route for login failure
router.get('/login/failed', authController.loginFailed);

// Route to start Google authentication
router.get('/google', authController.googleAuth);

// Route for Google callback
router.get('/google/callback', authController.googleCallback);

// Route for logout
router.get('/logout', authController.logout);

module.exports = router;
