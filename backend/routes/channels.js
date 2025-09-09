const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const Server = require('../models/Server');
const { auth } = require('../middleware/auth');
const { validateChannel } = require('../middleware/validation');

// Create channel
router.post('/', auth, validateChannel, async (req, res) => {
    try {
        const { name, type, serverId, description } = req.body;
        
        // Check if user has permission to create channels
        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({
                success: false,
                message: 'Server not found'
            });
        }

        const member = server.members.find(m => m.user.toString() === req.user.id);
        if (!member || !member.roles.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        const channel = new Channel({
            name,
            type: type || 'text',
            server: serverId,
            description
        });

        await channel.save();
        
        server.channels.push(channel._id);
        await server.save();

        res.status(201).json({
            success: true,
            channel
        });
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create channel'
        });
    }
});

// Get channels for a server
router.get('/server/:serverId', auth, async (req, res) => {
    try {
        const server = await Server.findById(req.params.serverId);
        
        if (!server) {
            return res.status(404).json({
                success: false,
                message: 'Server not found'
            });
        }

        // Check if user is a member
        const member = server.members.find(m => m.user.toString() === req.user.id);
        if (!member) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const channels = await Channel.find({
            server: req.params.serverId
        }).sort({ position: 1, createdAt: 1 });

        res.json({
            success: true,
            channels
        });
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch channels'
        });
    }
});

// Update channel
router.patch('/:channelId', auth, async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId).populate('server');
        
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check permissions
        const member = channel.server.members.find(m => m.user.toString() === req.user.id);
        if (!member || !member.roles.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        const { name, description, position } = req.body;
        
        if (name) channel.name = name;
        if (description) channel.description = description;
        if (position !== undefined) channel.position = position;

        await channel.save();

        res.json({
            success: true,
            channel
        });
    } catch (error) {
        console.error('Error updating channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update channel'
        });
    }
});

// Delete channel
router.delete('/:channelId', auth, async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId).populate('server');
        
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check permissions
        const member = channel.server.members.find(m => m.user.toString() === req.user.id);
        if (!member || !member.roles.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        // Remove channel from server
        const server = await Server.findById(channel.server._id);
        server.channels = server.channels.filter(c => c.toString() !== channel._id.toString());
        await server.save();

        await Channel.findByIdAndDelete(req.params.channelId);

        res.json({
            success: true,
            message: 'Channel deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete channel'
        });
    }
});

// Join voice channel
router.post('/:channelId/join-voice', auth, async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId).populate('server');
        
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        if (channel.type !== 'voice') {
            return res.status(400).json({
                success: false,
                message: 'Channel is not a voice channel'
            });
        }

        // Check if user is a member of the server
        const member = channel.server.members.find(m => m.user.toString() === req.user.id);
        if (!member) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // For now, just return success - actual voice implementation would require WebRTC
        res.json({
            success: true,
            message: 'Joined voice channel successfully',
            channelId: channel._id
        });
    } catch (error) {
        console.error('Error joining voice channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to join voice channel'
        });
    }
});

module.exports = router;