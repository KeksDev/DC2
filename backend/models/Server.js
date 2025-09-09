const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200
    },
    icon: {
        type: String,
        default: null
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        roles: [{
            type: String,
            default: 'member'
        }]
    }],
    channels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel'
    }],
    inviteCode: {
        type: String,
        unique: true,
        required: true
    },
    privacySettings: {
        inviteOnly: {
            type: Boolean,
            default: false
        },
        messageRetention: {
            type: Number,
            default: 90 // days
        },
        encryptMessages: {
            type: Boolean,
            default: true
        }
    },
    maxMembers: {
        type: Number,
        default: 100
    }
}, {
    timestamps: true
});

// Generate invite code before saving
serverSchema.pre('save', function(next) {
    if (!this.inviteCode) {
        this.inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    next();
});

module.exports = mongoose.model('Server', serverSchema);