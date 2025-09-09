const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { auth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiting');

// File model for tracking uploads
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true,
        unique: true
    },
    encryptedPath: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadedBy: {
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
        ref: 'Server',
        required: true
    },
    encryptionKey: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    }
}, {
    timestamps: true
});

// Auto-delete expired files
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const File = mongoose.model('File', fileSchema);

// Configure multer for temporary file storage
const upload = multer({
    dest: '/tmp/uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Allowed file types
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'text/plain',
            'application/pdf',
            'application/json',
            'audio/mpeg',
            'audio/wav',
            'video/mp4',
            'video/webm'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

// Ensure upload directories exist
const ensureDirectories = async () => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const encryptedDir = path.join(uploadsDir, 'encrypted');
    
    try {
        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.mkdir(encryptedDir, { recursive: true });
    } catch (error) {
        console.error('Error creating directories:', error);
    }
};

ensureDirectories();

// Encrypt file
const encryptFile = async (filePath, originalName) => {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const fileData = await fs.readFile(filePath);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    cipher.setAutoPadding(true);
    
    const encryptedData = Buffer.concat([
        cipher.update(fileData),
        cipher.final()
    ]);
    
    const encryptedFileName = crypto.randomBytes(16).toString('hex') + path.extname(originalName);
    const encryptedPath = path.join(__dirname, '../../uploads/encrypted', encryptedFileName);
    
    await fs.writeFile(encryptedPath, encryptedData);
    
    return {
        encryptedPath,
        encryptedFileName,
        key: key.toString('hex'),
        iv: iv.toString('hex')
    };
};

// Decrypt file
const decryptFile = async (encryptedPath, keyHex, ivHex) => {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    
    const encryptedData = await fs.readFile(encryptedPath);
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    decipher.setAutoPadding(true);
    
    const decryptedData = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);
    
    return decryptedData;
};

// Upload file
router.post('/:channelId', auth, uploadLimiter, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const Channel = require('../models/Channel');
        const Server = require('../models/Server');
        
        const channel = await Channel.findById(req.params.channelId).populate('server');
        
        if (!channel) {
            await fs.unlink(req.file.path); // Clean up temp file
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if user has permission to upload
        const member = channel.server.members.find(m => m.user.toString() === req.user.id);
        if (!member) {
            await fs.unlink(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Encrypt and save file
        const { encryptedPath, encryptedFileName, key, iv } = await encryptFile(
            req.file.path,
            req.file.originalname
        );

        const fileRecord = new File({
            originalName: req.file.originalname,
            fileName: encryptedFileName,
            encryptedPath,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user.id,
            channel: channel._id,
            server: channel.server._id,
            encryptionKey: key,
            iv
        });

        await fileRecord.save();

        // Clean up temporary file
        await fs.unlink(req.file.path);

        res.status(201).json({
            success: true,
            file: {
                id: fileRecord._id,
                originalName: fileRecord.originalName,
                size: fileRecord.size,
                mimeType: fileRecord.mimeType,
                uploadedAt: fileRecord.createdAt
            }
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        
        // Clean up temp file on error
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up temp file:', unlinkError);
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to upload file'
        });
    }
});

// Download file
router.get('/:fileId', auth, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId).populate({
            path: 'channel',
            populate: {
                path: 'server'
            }
        });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Check permissions
        const member = file.channel.server.members.find(m => m.user.toString() === req.user.id);
        if (!member) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Decrypt and send file
        const decryptedData = await decryptFile(file.encryptedPath, file.encryptionKey, file.iv);
        
        res.set({
            'Content-Type': file.mimeType,
            'Content-Disposition': `attachment; filename="${file.originalName}"`,
            'Content-Length': decryptedData.length
        });

        res.send(decryptedData);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file'
        });
    }
});

// Get files for a channel
router.get('/channel/:channelId', auth, async (req, res) => {
    try {
        const Channel = require('../models/Channel');
        
        const channel = await Channel.findById(req.params.channelId).populate('server');
        
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check permissions
        const member = channel.server.members.find(m => m.user.toString() === req.user.id);
        if (!member) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const files = await File.find({
            channel: req.params.channelId
        }).populate('uploadedBy', 'username').sort({ createdAt: -1 });

        res.json({
            success: true,
            files: files.map(file => ({
                id: file._id,
                originalName: file.originalName,
                size: file.size,
                mimeType: file.mimeType,
                uploadedBy: file.uploadedBy,
                uploadedAt: file.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch files'
        });
    }
});

// Delete file
router.delete('/:fileId', auth, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId).populate({
            path: 'channel',
            populate: {
                path: 'server'
            }
        });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Check permissions (uploader or admin)
        const member = file.channel.server.members.find(m => m.user.toString() === req.user.id);
        const isUploader = file.uploadedBy.toString() === req.user.id;
        const isAdmin = member && member.roles.includes('admin');

        if (!isUploader && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        // Delete encrypted file from disk
        try {
            await fs.unlink(file.encryptedPath);
        } catch (error) {
            console.error('Error deleting file from disk:', error);
        }

        // Delete file record
        await File.findByIdAndDelete(req.params.fileId);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file'
        });
    }
});

module.exports = router;