const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
        // Encrypted message content
        iv: String,
        authTag: String,
        data: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server'
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    attachments: [{
        filename: String,
        size: Number,
        mimetype: String,
        url: String
    }],
    reactions: [{
        emoji: String,
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    editedAt: {
        type: Date,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: function() {
            // Default expiration 30 days from now
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    }
}, {
    timestamps: true
});

// Index for automatic deletion of expired messages
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Remove deleted messages from queries by default
messageSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Message', messageSchema);