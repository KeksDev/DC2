const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiting');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email or username already exists'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            passwordHash: password // Will be hashed by the pre-save middleware
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            user: user.toJSON(),
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Internal server error during registration'
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Update last seen
        user.lastSeen = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            user: user.toJSON(),
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error during login'
        });
    }
};

const logout = async (req, res) => {
    try {
        // Update user status
        await User.findByIdAndUpdate(req.user._id, {
            status: 'offline',
            lastSeen: new Date()
        });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Internal server error during logout'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'username avatar status')
            .populate('servers', 'name icon');

        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Failed to fetch profile'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { avatar, status, privacySettings } = req.body;
        const updates = {};

        if (avatar !== undefined) updates.avatar = avatar;
        if (status !== undefined) updates.status = status;
        if (privacySettings !== undefined) updates.privacySettings = privacySettings;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Profile updated successfully',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Failed to update profile'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile
};