const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiting');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const {
    register,
    login,
    logout,
    getProfile,
    updateProfile
} = require('../controllers/authController');

// Public routes
router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);

// Protected routes
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;