const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (!user) {
            return res.status(401).json({ error: 'Token is no longer valid.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-passwordHash');
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};

module.exports = { auth, optionalAuth };