const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
        match: /^[a-zA-Z0-9_]+$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    passwordHash: {
        type: String,
        required: true,
        minlength: 8
    },
    avatar: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['online', 'away', 'busy', 'invisible'],
        default: 'online'
    },
    privacySettings: {
        allowDirectMessages: {
            type: String,
            enum: ['everyone', 'friends', 'none'],
            default: 'friends'
        },
        showOnlineStatus: {
            type: Boolean,
            default: true
        },
        dataRetention: {
            type: Number,
            default: 30 // days
        }
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    servers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server'
    }],
    lastSeen: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.passwordHash);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.passwordHash;
    delete userObject.__v;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);