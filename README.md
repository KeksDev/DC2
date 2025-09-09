# DC2 - Privacy-Focused Discord Alternative

DC2 is a privacy-focused, security-first Discord-like communication platform built with NodeJS and MongoDB. It features end-to-end encryption, automatic message deletion, and comprehensive privacy controls.

## 🔒 Privacy & Security Features

- **End-to-End Encryption**: All messages are encrypted before storage
- **Automatic Data Deletion**: Messages expire based on user-defined retention periods
- **Privacy Controls**: Granular privacy settings for each user
- **Rate Limiting**: Protection against spam and abuse
- **Input Validation**: Comprehensive validation and sanitization
- **Security Headers**: Full security header implementation
- **No Data Selling**: We never sell or share your personal data

## 🏗️ Architecture

- **Backend**: Express.js server with Socket.io for real-time communication
- **Frontend**: Vanilla JavaScript SPA with modern CSS
- **Database**: MongoDB with proper indexing and security
- **Deployment**: Docker containers for easy multi-server deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Docker (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/KeksDev/DC2.git
   cd DC2
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name dc2-mongo mongo:7.0
   
   # Or use your local MongoDB installation
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

### Docker Deployment

1. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Application: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
DC2/
├── backend/                 # Express.js backend server
│   ├── config/             # Database and app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication, validation, rate limiting
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   └── server.js           # Main server file
├── frontend/               # Frontend web application
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Application styles
│   ├── app.js              # Frontend JavaScript
│   └── nginx.conf          # Nginx configuration for production
├── shared/                 # Shared utilities
│   └── utils/
│       └── encryption.js   # Encryption utilities
└── docker-compose.yml      # Docker orchestration
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/dc2_discord

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
ENCRYPTION_KEY=your-32-character-encryption-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Multi-Server Deployment

DC2 is designed to run the backend and frontend on separate servers:

1. **Backend Server**:
   - Deploy the backend folder to your API server
   - Configure MongoDB connection
   - Set up SSL/TLS certificates
   - Configure CORS for your frontend domain

2. **Frontend Server**:
   - Deploy the frontend folder to your web server
   - Configure the API_URL to point to your backend
   - Set up CDN for static assets
   - Configure SSL/TLS certificates

3. **Database Server**:
   - MongoDB can run on a separate server
   - Configure replica sets for high availability
   - Set up regular backups with encryption

## 🔐 Security Considerations

### Data Protection
- All messages are encrypted using AES-256-GCM
- Passwords are hashed using bcryptjs with salt rounds
- JWT tokens for secure authentication
- Rate limiting on all endpoints

### Privacy Features
- Configurable message retention periods
- User-controlled privacy settings
- No tracking or analytics
- GDPR-compliant data handling

### Network Security
- HTTPS/WSS enforced in production
- Security headers (CSP, HSTS, etc.)
- CORS properly configured
- Input validation and sanitization

## 📱 Features

### User Management
- Secure registration and authentication
- Profile management with privacy controls
- Status indicators (online, away, busy, invisible)
- Friend system with blocking capabilities

### Messaging
- Real-time messaging with Socket.io
- Message encryption and automatic deletion
- Typing indicators
- Message editing and deletion

### Privacy Controls
- Granular privacy settings
- Data retention configuration
- Direct message permissions
- Online status visibility controls

## 🛠️ Development

### Running Tests
```bash
cd backend
npm test
```

### Linting
```bash
cd backend
npm run lint
```

### Building for Production
```bash
# Build Docker images
docker-compose build

# Or manually
cd backend && npm install --production
cd frontend && npm run build
```

## 🔄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Message Endpoints
- `POST /api/messages` - Send message
- `GET /api/messages/channel/:channelId` - Get channel messages
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete message

### Socket.IO Events
- `join_channel` - Join a channel
- `leave_channel` - Leave a channel
- `send_message` - Send real-time message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `update_status` - Update user status

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

## 🚧 Roadmap

- [ ] Voice channels and audio calls
- [ ] File sharing with encryption
- [ ] Mobile applications
- [ ] Server administration tools
- [ ] Advanced moderation features
- [ ] Integration with external services
- [ ] Advanced encryption options
- [ ] Multi-language support

---

**DC2** - Where privacy meets communication. 🔒💬