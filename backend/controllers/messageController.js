const Message = require('../models/Message');
const Channel = require('../models/Channel');
const Server = require('../models/Server');
const EncryptionUtil = require('../../shared/utils/encryption');

const encryption = new EncryptionUtil();

const sendMessage = async (req, res) => {
    try {
        const { content, channelId, type = 'text' } = req.body;
        const userId = req.user._id;

        // Verify channel exists and user has access
        const channel = await Channel.findById(channelId).populate('server');
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        // Check if user is member of the server (if it's not a DM)
        if (channel.server) {
            const server = await Server.findById(channel.server._id);
            const isMember = server.members.some(member => 
                member.user.toString() === userId.toString()
            );
            
            if (!isMember) {
                return res.status(403).json({ error: 'Access denied to this channel' });
            }
        }

        // Encrypt message content
        const encryptedContent = encryption.encrypt(content);
        if (!encryptedContent) {
            return res.status(500).json({ error: 'Failed to encrypt message' });
        }

        // Create message
        const message = new Message({
            content: encryptedContent,
            author: userId,
            channel: channelId,
            server: channel.server?._id,
            type
        });

        await message.save();
        
        // Populate author info for response
        await message.populate('author', 'username avatar');

        // Decrypt content for response
        const decryptedMessage = {
            ...message.toJSON(),
            content: content // Send back original content for immediate display
        };

        res.status(201).json({
            message: 'Message sent successfully',
            data: decryptedMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

const getMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const userId = req.user._id;

        // Verify channel access
        const channel = await Channel.findById(channelId).populate('server');
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        // Check server membership
        if (channel.server) {
            const server = await Server.findById(channel.server._id);
            const isMember = server.members.some(member => 
                member.user.toString() === userId.toString()
            );
            
            if (!isMember) {
                return res.status(403).json({ error: 'Access denied to this channel' });
            }
        }

        // Get messages with pagination
        const messages = await Message.find({ channel: channelId })
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Decrypt message contents
        const decryptedMessages = messages.map(message => {
            const messageObj = message.toJSON();
            const decryptedContent = encryption.decrypt(message.content);
            
            return {
                ...messageObj,
                content: decryptedContent || '[Encrypted Message]'
            };
        });

        res.json({
            messages: decryptedMessages.reverse(), // Reverse to show oldest first
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                hasMore: messages.length === parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        // Find message and verify ownership
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.author.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Can only edit your own messages' });
        }

        // Encrypt new content
        const encryptedContent = encryption.encrypt(content);
        if (!encryptedContent) {
            return res.status(500).json({ error: 'Failed to encrypt message' });
        }

        // Update message
        message.content = encryptedContent;
        message.editedAt = new Date();
        await message.save();

        await message.populate('author', 'username avatar');

        const decryptedMessage = {
            ...message.toJSON(),
            content: content
        };

        res.json({
            message: 'Message updated successfully',
            data: decryptedMessage
        });
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({ error: 'Failed to edit message' });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        // Find message and verify ownership
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.author.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Can only delete your own messages' });
        }

        // Soft delete
        message.deletedAt = new Date();
        await message.save();

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    editMessage,
    deleteMessage
};