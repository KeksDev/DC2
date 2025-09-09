const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Message sending rate limiting
const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 messages per minute
    message: {
        error: 'Too many messages sent, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// File upload rate limiting
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 uploads per minute
    message: {
        error: 'Too many file uploads, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    messageLimiter,
    uploadLimiter
};