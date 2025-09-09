const crypto = require('crypto');

class EncryptionUtil {
    constructor(key) {
        this.algorithm = 'aes-256-gcm';
        this.key = Buffer.from(key || process.env.ENCRYPTION_KEY || 'default-key-please-change-this-32', 'utf8');
        if (this.key.length !== 32) {
            this.key = crypto.scryptSync(this.key, 'salt', 32);
        }
    }

    encrypt(text) {
        if (!text) return null;
        
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipher('aes-256-cbc', this.key);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            return {
                iv: iv.toString('hex'),
                data: encrypted
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            return null;
        }
    }

    decrypt(encryptedData) {
        if (!encryptedData || !encryptedData.data) return null;
        
        try {
            const decipher = crypto.createDecipher('aes-256-cbc', this.key);
            
            let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    hashPassword(password) {
        return crypto.pbkdf2Sync(password, 'dc2-salt', 100000, 64, 'sha512').toString('hex');
    }

    generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = EncryptionUtil;