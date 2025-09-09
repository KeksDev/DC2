const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimiting');
const { validateMessage } = require('../middleware/validation');
const {
    sendMessage,
    getMessages,
    editMessage,
    deleteMessage
} = require('../controllers/messageController');

// All message routes require authentication
router.use(auth);

// Send message
router.post('/', messageLimiter, validateMessage, sendMessage);

// Get messages for a channel
router.get('/channel/:channelId', getMessages);

// Edit message
router.put('/:messageId', validateMessage, editMessage);

// Delete message
router.delete('/:messageId', deleteMessage);

module.exports = router;