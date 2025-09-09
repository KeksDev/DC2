const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Set up privacy-focused database options
        mongoose.set('toJSON', {
            transform: function(doc, ret) {
                delete ret.__v;
                return ret;
            }
        });

        // Enable strict mode for better security
        mongoose.set('strict', true);
        mongoose.set('strictQuery', true);

    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;