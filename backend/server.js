require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiting');

// Route imports
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const serverRoutes = require('./routes/servers');
const channelRoutes = require('./routes/channels');
const fileRoutes = require('./routes/files');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/files', fileRoutes);

// Socket.IO connection handling
const EncryptionUtil = require('../shared/utils/encryption');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Channel = require('./models/Channel');
const Message = require('./models/Message');

const encryption = new EncryptionUtil();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Handle joining channels
    socket.on('join_channel', async (channelId) => {
        try {
            const channel = await Channel.findById(channelId).populate('server');
            if (!channel) {
                socket.emit('error', { message: 'Channel not found' });
                return;
            }

            // Verify access to channel
            if (channel.server) {
                const Server = require('./models/Server');
                const server = await Server.findById(channel.server._id);
                const isMember = server.members.some(member => 
                    member.user.toString() === socket.userId
                );
                
                if (!isMember) {
                    socket.emit('error', { message: 'Access denied to channel' });
                    return;
                }
            }

            socket.join(`channel:${channelId}`);
            socket.emit('joined_channel', { channelId });
        } catch (error) {
            console.error('Join channel error:', error);
            socket.emit('error', { message: 'Failed to join channel' });
        }
    });

    // Handle leaving channels
    socket.on('leave_channel', (channelId) => {
        socket.leave(`channel:${channelId}`);
        socket.emit('left_channel', { channelId });
    });

    // Handle real-time messaging
    socket.on('send_message', async (data) => {
        try {
            const { content, channelId, type = 'text' } = data;

            // Verify channel access
            const channel = await Channel.findById(channelId).populate('server');
            if (!channel) {
                socket.emit('error', { message: 'Channel not found' });
                return;
            }

            if (channel.server) {
                const Server = require('./models/Server');
                const server = await Server.findById(channel.server._id);
                const isMember = server.members.some(member => 
                    member.user.toString() === socket.userId
                );
                
                if (!isMember) {
                    socket.emit('error', { message: 'Access denied to channel' });
                    return;
                }
            }

            // Encrypt message
            const encryptedContent = encryption.encrypt(content);
            if (!encryptedContent) {
                socket.emit('error', { message: 'Failed to encrypt message' });
                return;
            }

            // Save message to database
            const message = new Message({
                content: encryptedContent,
                author: socket.userId,
                channel: channelId,
                server: channel.server?._id,
                type
            });

            await message.save();
            await message.populate('author', 'username avatar');

            // Broadcast to all users in the channel
            const messageData = {
                ...message.toJSON(),
                content: content // Send unencrypted for real-time display
            };

            io.to(`channel:${channelId}`).emit('new_message', messageData);
        } catch (error) {
            console.error('Send message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Handle user status updates
    socket.on('update_status', async (status) => {
        try {
            await User.findByIdAndUpdate(socket.userId, { status });
            socket.broadcast.emit('user_status_update', {
                userId: socket.userId,
                status
            });
        } catch (error) {
            console.error('Status update error:', error);
        }
    });

    // Handle typing indicators
    socket.on('typing_start', (channelId) => {
        socket.to(`channel:${channelId}`).emit('user_typing', {
            userId: socket.userId,
            username: socket.user.username,
            channelId
        });
    });

    socket.on('typing_stop', (channelId) => {
        socket.to(`channel:${channelId}`).emit('user_stop_typing', {
            userId: socket.userId,
            channelId
        });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log(`User ${socket.user.username} disconnected`);
        
        try {
            // Update user's last seen and status
            await User.findByIdAndUpdate(socket.userId, {
                lastSeen: new Date(),
                status: 'offline'
            });

            // Notify other users
            socket.broadcast.emit('user_status_update', {
                userId: socket.userId,
                status: 'offline'
            });
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

module.exports = app;