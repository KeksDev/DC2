const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
    },
    type: {
        type: String,
        enum: ['text', 'voice', 'private'],
        default: 'text'
    },
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        required: true
    },
    description: {
        type: String,
        maxlength: 100
    },
    position: {
        type: Number,
        default: 0
    },
    permissions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        canRead: {
            type: Boolean,
            default: true
        },
        canWrite: {
            type: Boolean,
            default: true
        },
        canManage: {
            type: Boolean,
            default: false
        }
    }],
    privacySettings: {
        encryptMessages: {
            type: Boolean,
            default: true
        },
        logMessages: {
            type: Boolean,
            default: true
        },
        messageRetention: {
            type: Number,
            default: 30 // days
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Channel', channelSchema);