const express = require('express');
const router = express.Router();
const Server = require('../models/Server');
const Channel = require('../models/Channel');
const { auth } = require('../middleware/auth');
const { validateServer } = require('../middleware/validation');
const { serverCreationLimiter } = require('../middleware/rateLimiting');

// Create a new server
router.post('/', auth, serverCreationLimiter, validateServer, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const server = new Server({
            name,
            description,
            owner: req.user.id,
            members: [{
                user: req.user.id,
                roles: ['owner', 'admin']
            }]
        });

        await server.save();

        // Create default channels
        const generalChannel = new Channel({
            name: 'general',
            type: 'text',
            server: server._id,
            description: 'General discussion'
        });

        const voiceChannel = new Channel({
            name: 'General Voice',
            type: 'voice',
            server: server._id,
            description: 'General voice chat'
        });

        await Promise.all([generalChannel.save(), voiceChannel.save()]);
        
        server.channels.push(generalChannel._id, voiceChannel._id);
        await server.save();

        res.status(201).json({
            success: true,
            server: {
                id: server._id,
                name: server.name,
                description: server.description,
                inviteCode: server.inviteCode
            }
        });
    } catch (error) {
        console.error('Error creating server:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create server'
        });
    }
});

// Get user's servers
router.get('/', auth, async (req, res) => {
    try {
        const servers = await Server.find({
            'members.user': req.user.id
        }).populate('channels').select('-inviteCode');

        res.json({
            success: true,
            servers
        });
    } catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch servers'
        });
    }
});

// Join server via invite
router.post('/join/:inviteCode', auth, async (req, res) => {
    try {
        const server = await Server.findOne({
            inviteCode: req.params.inviteCode
        });

        if (!server) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code'
            });
        }

        // Check if user is already a member
        const existingMember = server.members.find(
            member => member.user.toString() === req.user.id
        );

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this server'
            });
        }

        // Check member limit
        if (server.members.length >= server.maxMembers) {
            return res.status(400).json({
                success: false,
                message: 'Server is at maximum capacity'
            });
        }

        server.members.push({
            user: req.user.id,
            roles: ['member']
        });

        await server.save();

        res.json({
            success: true,
            message: 'Successfully joined server',
            server: {
                id: server._id,
                name: server.name,
                description: server.description
            }
        });
    } catch (error) {
        console.error('Error joining server:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to join server'
        });
    }
});

// Server administration routes
router.patch('/:serverId/settings', auth, async (req, res) => {
    try {
        const server = await Server.findById(req.params.serverId);
        
        if (!server) {
            return res.status(404).json({
                success: false,
                message: 'Server not found'
            });
        }

        // Check if user is admin
        const member = server.members.find(
            m => m.user.toString() === req.user.id
        );

        if (!member || !member.roles.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        const { name, description, maxMembers, privacySettings } = req.body;
        
        if (name) server.name = name;
        if (description) server.description = description;
        if (maxMembers) server.maxMembers = maxMembers;
        if (privacySettings) {
            server.privacySettings = { ...server.privacySettings, ...privacySettings };
        }

        await server.save();

        res.json({
            success: true,
            message: 'Server settings updated'
        });
    } catch (error) {
        console.error('Error updating server settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update server settings'
        });
    }
});

// Kick member
router.delete('/:serverId/members/:userId', auth, async (req, res) => {
    try {
        const server = await Server.findById(req.params.serverId);
        
        if (!server) {
            return res.status(404).json({
                success: false,
                message: 'Server not found'
            });
        }

        // Check if user is admin
        const member = server.members.find(
            m => m.user.toString() === req.user.id
        );

        if (!member || !member.roles.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        // Can't kick the owner
        if (server.owner.toString() === req.params.userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot kick server owner'
            });
        }

        server.members = server.members.filter(
            m => m.user.toString() !== req.params.userId
        );

        await server.save();

        res.json({
            success: true,
            message: 'Member kicked successfully'
        });
    } catch (error) {
        console.error('Error kicking member:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to kick member'
        });
    }
});

module.exports = router;