class DC2App {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.socket = null;
        this.currentUser = null;
        this.currentChannel = null;
        this.token = localStorage.getItem('dc2_token');
        this.typingTimer = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Auth form listeners
        document.getElementById('login-tab').addEventListener('click', () => this.showLoginForm());
        document.getElementById('register-tab').addEventListener('click', () => this.showRegisterForm());
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

        // Main app listeners
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        document.getElementById('user-status').addEventListener('change', (e) => this.updateStatus(e.target.value));
        document.getElementById('send-button').addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            } else {
                this.handleTyping();
            }
        });

        // Privacy modal listeners
        document.getElementById('privacy-settings-btn').addEventListener('click', () => this.showPrivacyModal());
        document.getElementById('close-privacy-modal').addEventListener('click', () => this.hidePrivacyModal());
        document.getElementById('save-privacy-settings').addEventListener('click', () => this.savePrivacySettings());

        // Close modal when clicking outside
        document.getElementById('privacy-modal').addEventListener('click', (e) => {
            if (e.target.id === 'privacy-modal') {
                this.hidePrivacyModal();
            }
        });
    }

    checkAuthStatus() {
        if (this.token) {
            this.validateToken();
        } else {
            this.showAuthContainer();
        }
    }

    async validateToken() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.showMainApp();
                this.initializeSocket();
            } else {
                localStorage.removeItem('dc2_token');
                this.showAuthContainer();
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('dc2_token');
            this.showAuthContainer();
        }
    }

    showAuthContainer() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('main-container').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('main-container').classList.remove('hidden');
        this.updateUserInterface();
    }

    showLoginForm() {
        document.getElementById('login-tab').classList.add('active');
        document.getElementById('register-tab').classList.remove('active');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    }

    showRegisterForm() {
        document.getElementById('register-tab').classList.add('active');
        document.getElementById('login-tab').classList.remove('active');
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('dc2_token', this.token);
                this.showMainApp();
                this.initializeSocket();
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Network error during login', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('dc2_token', this.token);
                this.showMainApp();
                this.initializeSocket();
                this.showNotification('Registration successful! Welcome to DC2!', 'success');
            } else {
                this.showNotification(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Network error during registration', 'error');
        }
    }

    async handleLogout() {
        try {
            await fetch(`${this.apiUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        localStorage.removeItem('dc2_token');
        this.token = null;
        this.currentUser = null;
        
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.showAuthContainer();
        this.showNotification('Logged out successfully', 'success');
    }

    initializeSocket() {
        this.socket = io('http://localhost:5000', {
            auth: {
                token: this.token
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
            // Join a default channel for demo purposes
            this.joinDemoChannel();
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('new_message', (message) => {
            this.displayMessage(message);
        });

        this.socket.on('user_typing', (data) => {
            this.showTypingIndicator(data);
        });

        this.socket.on('user_stop_typing', (data) => {
            this.hideTypingIndicator(data);
        });

        this.socket.on('user_status_update', (data) => {
            this.updateUserStatus(data);
        });

        this.socket.on('error', (error) => {
            this.showNotification(error.message, 'error');
        });
    }

    joinDemoChannel() {
        // For demo purposes, we'll create a virtual "general" channel
        this.currentChannel = {
            id: 'demo-general',
            name: 'general',
            description: 'Welcome to DC2 - Privacy-focused communication!'
        };
        
        document.getElementById('channel-name').textContent = `# ${this.currentChannel.name}`;
        document.getElementById('channel-description').textContent = this.currentChannel.description;
        
        // Add welcome message
        this.displayMessage({
            _id: 'welcome',
            content: 'Welcome to DC2! This is a privacy-focused Discord alternative. All messages are encrypted end-to-end.',
            author: {
                username: 'DC2 System',
                avatar: null
            },
            createdAt: new Date().toISOString(),
            type: 'system'
        });
    }

    updateUserInterface() {
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.username;
            document.getElementById('user-status').value = this.currentUser.status || 'online';
            
            // Update avatar
            const avatarElement = document.getElementById('user-avatar');
            if (this.currentUser.avatar) {
                avatarElement.innerHTML = `<img src="${this.currentUser.avatar}" alt="Avatar">`;
            } else {
                avatarElement.innerHTML = `<i class="fas fa-user"></i>`;
            }
        }
    }

    async updateStatus(status) {
        if (this.socket) {
            this.socket.emit('update_status', status);
        }

        try {
            await fetch(`${this.apiUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Status update error:', error);
        }
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const content = input.value.trim();

        if (!content || !this.socket || !this.currentChannel) return;

        this.socket.emit('send_message', {
            content,
            channelId: this.currentChannel.id,
            type: 'text'
        });

        input.value = '';
        this.stopTyping();
    }

    displayMessage(message) {
        const messagesList = document.getElementById('messages-list');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.author._id === this.currentUser?._id ? 'own' : ''}`;
        
        const isSystemMessage = message.type === 'system';
        const timestamp = new Date(message.createdAt).toLocaleTimeString();

        messageElement.innerHTML = `
            <div class="message-avatar">
                ${isSystemMessage ? '<i class="fas fa-info-circle"></i>' : 
                  message.author.avatar ? `<img src="${message.author.avatar}" alt="Avatar">` : 
                  '<i class="fas fa-user"></i>'}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${message.author.username}</span>
                    <span class="message-timestamp">${timestamp}</span>
                    ${message.editedAt ? '<span class="message-edited">(edited)</span>' : ''}
                </div>
                <div class="message-text">${this.escapeHtml(message.content)}</div>
            </div>
        `;

        messageElement.classList.add('fade-in');
        messagesList.appendChild(messageElement);
        messagesList.scrollTop = messagesList.scrollHeight;
    }

    handleTyping() {
        if (!this.socket || !this.currentChannel) return;

        if (!this.typingTimer) {
            this.socket.emit('typing_start', this.currentChannel.id);
        }

        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            this.stopTyping();
        }, 3000);
    }

    stopTyping() {
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
            this.typingTimer = null;
            
            if (this.socket && this.currentChannel) {
                this.socket.emit('typing_stop', this.currentChannel.id);
            }
        }
    }

    showTypingIndicator(data) {
        if (data.userId === this.currentUser?._id) return;

        const indicator = document.getElementById('typing-indicator');
        indicator.textContent = `${data.username} is typing...`;
        indicator.classList.remove('hidden');
    }

    hideTypingIndicator(data) {
        if (data.userId === this.currentUser?._id) return;

        const indicator = document.getElementById('typing-indicator');
        indicator.classList.add('hidden');
    }

    updateUserStatus(data) {
        // Update user status in UI if needed
        console.log('User status updated:', data);
    }

    showPrivacyModal() {
        const modal = document.getElementById('privacy-modal');
        modal.classList.remove('hidden');
        
        // Load current privacy settings
        if (this.currentUser && this.currentUser.privacySettings) {
            const settings = this.currentUser.privacySettings;
            document.getElementById('allow-dm').value = settings.allowDirectMessages || 'friends';
            document.getElementById('show-online-status').checked = settings.showOnlineStatus !== false;
            document.getElementById('data-retention').value = settings.dataRetention || 30;
        }
    }

    hidePrivacyModal() {
        document.getElementById('privacy-modal').classList.add('hidden');
    }

    async savePrivacySettings() {
        const settings = {
            allowDirectMessages: document.getElementById('allow-dm').value,
            showOnlineStatus: document.getElementById('show-online-status').checked,
            dataRetention: parseInt(document.getElementById('data-retention').value)
        };

        try {
            const response = await fetch(`${this.apiUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ privacySettings: settings })
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.hidePrivacyModal();
                this.showNotification('Privacy settings updated successfully!', 'success');
            } else {
                this.showNotification('Failed to update privacy settings', 'error');
            }
        } catch (error) {
            console.error('Privacy settings error:', error);
            this.showNotification('Network error while updating settings', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Set background color based on type
        const colors = {
            success: '#3BA55C',
            error: '#ED4245',
            warning: '#FAA61A',
            info: '#5865F2'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);

        // Add CSS animations if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DC2App();
});