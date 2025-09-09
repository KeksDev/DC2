const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

const validateRegistration = [
    body('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    handleValidationErrors
];

const validateLogin = [
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .trim()
        .escape(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

const validateMessage = [
    body('content')
        .isLength({ min: 1, max: 2000 })
        .withMessage('Message content must be between 1 and 2000 characters')
        .trim(),
    
    body('channelId')
        .isMongoId()
        .withMessage('Invalid channel ID'),
    
    handleValidationErrors
];

const validateServer = [
    body('name')
        .isLength({ min: 1, max: 50 })
        .withMessage('Server name must be between 1 and 50 characters')
        .trim()
        .escape(),
    
    body('description')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Description must be less than 200 characters')
        .trim()
        .escape(),
    
    handleValidationErrors
];

const validateChannel = [
    body('name')
        .isLength({ min: 1, max: 30 })
        .withMessage('Channel name must be between 1 and 30 characters')
        .trim()
        .escape(),
    
    body('type')
        .optional()
        .isIn(['text', 'voice', 'private'])
        .withMessage('Invalid channel type'),
    
    body('serverId')
        .isMongoId()
        .withMessage('Invalid server ID'),
    
    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateMessage,
    validateServer,
    validateChannel,
    handleValidationErrors
};