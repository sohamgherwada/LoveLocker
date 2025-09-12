// Love Locker - Main JavaScript File

class LoveLocker {
    constructor() {
        this.currentUser = null;
        this.partner = null;
        this.letters = [];
        this.emailConfig = window.LOVELOCKER_CONFIG?.emailjs || {
            serviceId: 'gmail',
            templateId: 'love_locker_notification',
            publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.checkConnectionStatus();
        this.startDailyCheck();
        this.checkForUnlockableLetters();
        this.initializeEmailJS();
        this.checkPasswordReset();
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
        
        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => this.hideModal(e.target.closest('.modal')));
        });

        // Switch between login/register
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });

        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('createLetterForm').addEventListener('submit', (e) => this.handleCreateLetter(e));
        document.getElementById('unlockLetterForm').addEventListener('submit', (e) => this.handleUnlockLetter(e));

        // Dashboard controls
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('copyCodeBtn').addEventListener('click', () => this.copyConnectionCode());
        document.getElementById('connectBtn').addEventListener('click', () => this.connectWithPartner());
        document.getElementById('createLetterBtn').addEventListener('click', () => this.showModal('createLetterModal'));

        // Notification settings
        document.getElementById('emailNotifications').addEventListener('change', (e) => this.updateNotificationSettings('email', e.target.checked));
        document.getElementById('browserNotifications').addEventListener('change', (e) => this.updateNotificationSettings('browser', e.target.checked));

        // Password reset
        document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('forgotPasswordModal');
        });

        document.getElementById('backToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('forgotPasswordModal');
            this.showModal('loginModal');
        });

        document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => this.handleForgotPassword(e));
        document.getElementById('resetPasswordForm').addEventListener('submit', (e) => this.handleResetPassword(e));

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // User Authentication
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const user = await this.authenticateUser(email, password);
            if (user) {
                this.currentUser = user;
                this.saveUserData();
                this.hideModal('loginModal');
                this.showDashboard();
                this.showNotification('Welcome back!', 'success');
                this.requestNotificationPermission();
            } else {
                this.showNotification('Invalid credentials', 'error');
            }
        } catch (error) {
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const age = document.getElementById('registerAge').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const user = await this.createUser({ name, email, age, password });
            if (user) {
                this.currentUser = user;
                this.saveUserData();
                this.hideModal('registerModal');
                this.showDashboard();
                this.showNotification('Account created successfully!', 'success');
                this.requestNotificationPermission();
            } else {
                this.showNotification('Registration failed. Email might already exist.', 'error');
            }
        } catch (error) {
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    // User Management (Simulated - in real app, this would connect to a backend)
    async authenticateUser(email, password) {
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === email && u.password === password);
        return user || null;
    }

    async createUser(userData) {
        const users = this.getStoredUsers();
        
        // Check if user already exists
        if (users.find(u => u.email === userData.email)) {
            return null;
        }

        const newUser = {
            id: Date.now().toString(),
            ...userData,
            connectionCode: this.generateConnectionCode(),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('loveLockerUsers', JSON.stringify(users));
        return newUser;
    }

    getStoredUsers() {
        const users = localStorage.getItem('loveLockerUsers');
        return users ? JSON.parse(users) : [];
    }

    generateConnectionCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Connection Management
    async connectWithPartner() {
        const partnerCode = document.getElementById('partnerCode').value.trim();
        
        if (!partnerCode) {
            this.showNotification('Please enter a connection code', 'error');
            return;
        }

        const users = this.getStoredUsers();
        const partner = users.find(u => u.connectionCode === partnerCode && u.id !== this.currentUser.id);

        if (!partner) {
            this.showNotification('Invalid connection code', 'error');
            return;
        }

        // Check if either user is already connected
        if (this.currentUser.partnerId || partner.partnerId) {
            this.showNotification('One of you is already connected to someone else', 'error');
            return;
        }

        // Create connection
        this.currentUser.partnerId = partner.id;
        partner.partnerId = this.currentUser.id;

        // Update users in storage
        const updatedUsers = users.map(u => {
            if (u.id === this.currentUser.id) return this.currentUser;
            if (u.id === partner.id) return partner;
            return u;
        });

        localStorage.setItem('loveLockerUsers', JSON.stringify(updatedUsers));
        
        this.partner = partner;
        this.saveUserData();
        this.checkConnectionStatus();
        this.showNotification(`Connected with ${partner.name}!`, 'success');
        document.getElementById('partnerCode').value = '';
    }

    copyConnectionCode() {
        const code = this.currentUser.connectionCode;
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Connection code copied!', 'success');
        });
    }

    // Letter Management
    async handleCreateLetter(e) {
        e.preventDefault();
        const title = document.getElementById('letterTitle').value;
        const unlockDate = document.getElementById('unlockDate').value;
        const content = document.getElementById('letterContent').value;
        
        // Generate random secret code
        const secretCode = this.generateSecretCode();

        const letter = {
            id: Date.now().toString(),
            title,
            content,
            secretCode,
            unlockDate,
            createdAt: new Date().toISOString(),
            authorId: this.currentUser.id,
            recipientId: this.partner.id,
            isUnlocked: false,
            notificationSent: false
        };

        this.letters.push(letter);
        this.saveLetters();
        this.displayLetters();
        this.hideModal('createLetterModal');
        this.showNotification('Time capsule letter created! Your partner will receive the secret code via email when it\'s ready to unlock.', 'success');
        
        // Reset form
        document.getElementById('createLetterForm').reset();
    }

    generateSecretCode() {
        // Generate a random 8-character code with letters and numbers
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Password Reset Methods
    async handleForgotPassword(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        
        try {
            const user = await this.findUserByEmail(email);
            if (user) {
                // Generate reset token
                const resetToken = this.generateResetToken();
                user.resetToken = resetToken;
                user.resetTokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
                
                // Update user in storage
                this.updateUserInStorage(user);
                
                // Send reset email
                await this.sendPasswordResetEmail(user, resetToken);
                
                this.hideModal('forgotPasswordModal');
                this.showNotification('Password reset link sent to your email!', 'success');
            } else {
                this.showNotification('No account found with that email address', 'error');
            }
        } catch (error) {
            this.showNotification('Failed to send reset email. Please try again.', 'error');
        }
    }

    async handleResetPassword(e) {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        try {
            const resetToken = this.getResetTokenFromURL();
            const user = await this.findUserByResetToken(resetToken);
            
            if (user && user.resetTokenExpiry > Date.now()) {
                // Update password
                user.password = newPassword;
                user.resetToken = null;
                user.resetTokenExpiry = null;
                
                // Update user in storage
                this.updateUserInStorage(user);
                
                this.hideModal('resetPasswordModal');
                this.showNotification('Password reset successfully! You can now login with your new password.', 'success');
                
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                this.showNotification('Invalid or expired reset token', 'error');
            }
        } catch (error) {
            this.showNotification('Failed to reset password. Please try again.', 'error');
        }
    }

    async findUserByEmail(email) {
        const users = this.getStoredUsers();
        return users.find(u => u.email === email) || null;
    }

    async findUserByResetToken(token) {
        const users = this.getStoredUsers();
        return users.find(u => u.resetToken === token) || null;
    }

    generateResetToken() {
        // Generate a secure reset token
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    getResetTokenFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('reset_token');
    }

    updateUserInStorage(updatedUser) {
        const users = this.getStoredUsers();
        const userIndex = users.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('loveLockerUsers', JSON.stringify(users));
        }
    }

    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${window.location.origin}${window.location.pathname}?reset_token=${resetToken}`;
        const appUrl = window.location.origin + window.location.pathname;
        
        const emailData = {
            to: user.email,
            subject: `💕 LoveLocker - Password Reset Request`,
            html: this.generatePasswordResetEmail(user, resetUrl, appUrl),
            type: 'password_reset'
        };

        try {
            // Send email via Gmail API
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('📧 Password reset email sent via Gmail:', result.messageId);
            } else {
                throw new Error(result.error || 'Failed to send email');
            }
        } catch (error) {
            console.error('📧 Password reset email failed:', error);
            this.showNotification('Failed to send reset email', 'error');
        }

        return emailData;
    }

    generatePasswordResetEmail(user, resetUrl, appUrl) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h1 style="text-align: center; font-family: 'Dancing Script', cursive; font-size: 2.5rem; margin-bottom: 20px;">💕 LoveLocker</h1>
                
                <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin: 20px 0;">
                    <h2 style="color: #ff6b9d; margin-bottom: 15px;">Password Reset Request 🔐</h2>
                    
                    <p>Dear ${user.name},</p>
                    
                    <p>We received a request to reset your LoveLocker password. If you made this request, click the button below to set a new password.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff6b9d;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">Reset Your Password</h3>
                        <p style="margin: 5px 0; color: #666;">This link will expire in 24 hours for security reasons.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: linear-gradient(135deg, #ff6b9d, #ff8fab); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Security Notice</h4>
                        <p style="margin: 0; color: #856404; font-size: 0.9rem;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                    </div>
                    
                    <div style="background: #f8f9fa; border: 1px solid #e1e5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #666; font-size: 0.9rem;">Can't click the button? Copy and paste this link:</p>
                        <a href="${resetUrl}" style="color: #ff6b9d; text-decoration: none; font-weight: bold; word-break: break-all;">${resetUrl}</a>
                    </div>
                    
                    <p style="color: #666; font-size: 0.9rem; text-align: center; margin-top: 30px;">
                        Made with 💕 by LoveLocker
                    </p>
                </div>
            </div>
        `;
    }

    checkPasswordReset() {
        const resetToken = this.getResetTokenFromURL();
        if (resetToken) {
            // Show reset password modal if token is present
            this.showModal('resetPasswordModal');
        }
    }

    async handleUnlockLetter(e) {
        e.preventDefault();
        const unlockCode = document.getElementById('unlockCode').value;
        const letterId = this.currentUnlockLetterId;

        const letter = this.letters.find(l => l.id === letterId);
        
        if (letter && letter.secretCode === unlockCode) {
            letter.isUnlocked = true;
            this.saveLetters();
            this.displayLetters();
            this.hideModal('unlockLetterModal');
            this.showLetter(letter);
            this.showNotification('Letter unlocked!', 'success');
        } else {
            this.showNotification('Invalid secret code', 'error');
        }
        
        document.getElementById('unlockCode').value = '';
    }

    showLetter(letter) {
        const modal = document.getElementById('viewLetterModal');
        const content = document.getElementById('letterContent');
        
        content.innerHTML = `
            <div class="letter-view">
                <h2>${letter.title}</h2>
                <p class="letter-date">Created on ${new Date(letter.createdAt).toLocaleDateString()}</p>
                <div class="letter-text">
                    ${letter.content.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        
        this.showModal('viewLetterModal');
    }

    displayLetters() {
        const lettersList = document.getElementById('lettersList');
        const today = new Date().toISOString().split('T')[0];
        
        if (this.letters.length === 0) {
            lettersList.innerHTML = '<p class="text-center">No letters yet. Create your first time capsule!</p>';
            return;
        }

        lettersList.innerHTML = this.letters
            .filter(letter => letter.recipientId === this.currentUser.id)
            .map(letter => {
                const canUnlock = letter.unlockDate <= today;
                const isUnlocked = letter.isUnlocked;
                
                return `
                    <div class="letter-card" onclick="${canUnlock && !isUnlocked ? `this.unlockLetter('${letter.id}')` : isUnlocked ? `this.showLetter('${letter.id}')` : ''}">
                        <div class="letter-header">
                            <span class="letter-title">${letter.title}</span>
                            <span class="letter-status ${isUnlocked ? 'unlocked' : 'locked'}">
                                ${isUnlocked ? 'Unlocked' : canUnlock ? 'Ready to Unlock' : 'Locked'}
                            </span>
                        </div>
                        <div class="letter-date">
                            Unlocks on ${new Date(letter.unlockDate).toLocaleDateString()}
                        </div>
                        ${isUnlocked ? `<div class="letter-preview">${letter.content.substring(0, 100)}...</div>` : ''}
                    </div>
                `;
            }).join('');

        // Add click handlers
        this.letters
            .filter(letter => letter.recipientId === this.currentUser.id)
            .forEach(letter => {
                const canUnlock = letter.unlockDate <= new Date().toISOString().split('T')[0];
                const isUnlocked = letter.isUnlocked;
                
                if (canUnlock && !isUnlocked) {
                    const card = document.querySelector(`[onclick*="${letter.id}"]`);
                    if (card) {
                        card.onclick = () => this.unlockLetter(letter.id);
                    }
                } else if (isUnlocked) {
                    const card = document.querySelector(`[onclick*="${letter.id}"]`);
                    if (card) {
                        card.onclick = () => this.showLetter(letter);
                    }
                }
            });
    }

    unlockLetter(letterId) {
        this.currentUnlockLetterId = letterId;
        this.showModal('unlockLetterModal');
    }

    // Data Management
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('loveLockerCurrentUser', JSON.stringify(this.currentUser));
        }
        if (this.partner) {
            localStorage.setItem('loveLockerPartner', JSON.stringify(this.partner));
        }
    }

    loadUserData() {
        const userData = localStorage.getItem('loveLockerCurrentUser');
        const partnerData = localStorage.getItem('loveLockerPartner');
        
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
        if (partnerData) {
            this.partner = JSON.parse(partnerData);
        }
    }

    saveLetters() {
        localStorage.setItem('loveLockerLetters', JSON.stringify(this.letters));
    }

    loadLetters() {
        const letters = localStorage.getItem('loveLockerLetters');
        this.letters = letters ? JSON.parse(letters) : [];
    }

    // UI Management
    showDashboard() {
        document.querySelector('.hero').style.display = 'none';
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('userName').textContent = this.currentUser.name;
        
        if (this.partner) {
            document.getElementById('partnerName').textContent = this.partner.name;
        }
        
        this.loadLetters();
        this.displayLetters();
        this.loadNotificationSettings();
    }

    checkConnectionStatus() {
        if (this.currentUser && this.currentUser.partnerId) {
            document.getElementById('notConnected').classList.add('hidden');
            document.getElementById('connected').classList.remove('hidden');
        } else {
            document.getElementById('notConnected').classList.remove('hidden');
            document.getElementById('connected').classList.add('hidden');
        }
    }

    logout() {
        this.currentUser = null;
        this.partner = null;
        this.letters = [];
        
        localStorage.removeItem('loveLockerCurrentUser');
        localStorage.removeItem('loveLockerPartner');
        localStorage.removeItem('loveLockerLetters');
        
        document.getElementById('dashboard').classList.add('hidden');
        document.querySelector('.hero').style.display = 'block';
        
        this.showNotification('Logged out successfully', 'success');
    }

    // Daily Check System
    startDailyCheck() {
        // Check for unlockable letters every hour
        setInterval(() => {
            this.checkForUnlockableLetters();
        }, 60 * 60 * 1000); // 1 hour

        // Also check immediately when the app loads
        this.checkForUnlockableLetters();
    }

    checkForUnlockableLetters() {
        if (!this.currentUser || !this.partner) return;

        const today = new Date().toISOString().split('T')[0];
        const unlockableLetters = this.letters.filter(letter => 
            letter.recipientId === this.currentUser.id && 
            letter.unlockDate <= today && 
            !letter.isUnlocked &&
            !letter.notificationSent
        );

        if (unlockableLetters.length > 0) {
            this.sendUnlockNotifications(unlockableLetters);
        }
    }

    async sendUnlockNotifications(letters) {
        for (const letter of letters) {
            // Mark notification as sent
            letter.notificationSent = true;
            
            // Send email notification (simulated)
            await this.sendEmailNotification(letter);
            
            // Show browser notification
            this.showBrowserNotification(letter);
            
            // Show in-app notification
            this.showNotification(`💌 New letter ready to unlock: "${letter.title}"`, 'success');
        }
        
        this.saveLetters();
    }

    initializeEmailJS() {
        // Initialize EmailJS with your public key
        if (typeof emailjs !== 'undefined' && this.emailConfig.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
            emailjs.init(this.emailConfig.publicKey);
            console.log('📧 EmailJS initialized successfully');
        } else {
            console.log('📧 EmailJS not configured - using simulation mode');
        }
    }

    async sendEmailNotification(letter) {
        // Check if email notifications are enabled
        if (this.currentUser && this.currentUser.notificationSettings && this.currentUser.notificationSettings.email === false) {
            console.log('📧 Email notifications disabled');
            return;
        }

        // Get the current website URL
        const currentUrl = window.location.origin + window.location.pathname;
        const fallbackUrl = window.LOVELOCKER_CONFIG?.websiteUrl || 'https://love-locker.vercel.app';
        
        const emailData = {
            to: this.currentUser.email,
            subject: `💕 LoveLocker - Letter Ready to Unlock!`,
            html: this.generateLetterNotificationEmail(letter, currentUrl || fallbackUrl),
            type: 'letter_notification'
        };

        try {
            // Send email via Gmail API
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('📧 Email sent successfully via Gmail:', result.messageId);
                this.showNotification('Email notification sent!', 'success');
            } else {
                throw new Error(result.error || 'Failed to send email');
            }
        } catch (error) {
            console.error('📧 Email sending failed:', error);
            this.showNotification('Failed to send email notification', 'error');
        }

        return emailData;
    }

    generateLetterNotificationEmail(letter, appUrl) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h1 style="text-align: center; font-family: 'Dancing Script', cursive; font-size: 2.5rem; margin-bottom: 20px;">💕 LoveLocker</h1>
                
                <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin: 20px 0;">
                    <h2 style="color: #ff6b9d; margin-bottom: 15px;">A Love Letter is Ready to Unlock! 💌</h2>
                    
                    <p>Dear ${this.currentUser.name},</p>
                    
                    <p>Great news! A time capsule letter from ${this.partner ? this.partner.name : 'your partner'} is ready to be unlocked today!</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff6b9d;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">Letter Details:</h3>
                        <p style="margin: 5px 0;"><strong>Title:</strong> ${letter.title}</p>
                        <p style="margin: 5px 0;"><strong>Unlock Date:</strong> ${new Date(letter.unlockDate).toLocaleDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Created:</strong> ${new Date(letter.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #856404;">🔑 Your Secret Code</h4>
                        <p style="margin: 0 0 10px 0; color: #856404;">Use this secret code to unlock your letter:</p>
                        <div style="background: #f8f9fa; border: 2px solid #ff6b9d; padding: 10px; border-radius: 5px; text-align: center; margin: 10px 0;">
                            <strong style="font-size: 1.2rem; color: #333; font-family: 'Courier New', monospace;">${letter.secretCode}</strong>
                        </div>
                        <p style="margin: 10px 0 0 0; color: #856404; font-size: 0.9rem;">Visit your LoveLocker and enter this code to unlock and read your special message!</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${appUrl}" style="background: linear-gradient(135deg, #ff6b9d, #ff8fab); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">💕 Open LoveLocker</a>
                    </div>
                    
                    <div style="background: #f8f9fa; border: 1px solid #e1e5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #666; font-size: 0.9rem;">Can't click the button? Copy and paste this link:</p>
                        <a href="${appUrl}" style="color: #ff6b9d; text-decoration: none; font-weight: bold; word-break: break-all;">${appUrl}</a>
                    </div>
                    
                    <p style="color: #666; font-size: 0.9rem; text-align: center; margin-top: 30px;">
                        Made with 💕 by LoveLocker
                    </p>
                </div>
            </div>
        `;
    }

    showBrowserNotification(letter) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('💌 Love Locker - Letter Ready!', {
                body: `"${letter.title}" is ready to unlock! Ask your partner for the secret code.`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💕</text></svg>',
                tag: `letter-${letter.id}`
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('Notifications enabled! You\'ll be notified when letters are ready to unlock.', 'success');
                    document.getElementById('browserNotifications').checked = true;
                }
            });
        } else if (Notification.permission === 'granted') {
            document.getElementById('browserNotifications').checked = true;
        }
    }

    updateNotificationSettings(type, enabled) {
        if (!this.currentUser) return;

        if (!this.currentUser.notificationSettings) {
            this.currentUser.notificationSettings = {};
        }

        this.currentUser.notificationSettings[type] = enabled;
        this.saveUserData();

        if (type === 'browser' && enabled) {
            this.requestNotificationPermission();
        }

        this.showNotification(`${type} notifications ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    loadNotificationSettings() {
        if (this.currentUser && this.currentUser.notificationSettings) {
            const settings = this.currentUser.notificationSettings;
            document.getElementById('emailNotifications').checked = settings.email !== false;
            document.getElementById('browserNotifications').checked = settings.browser === true;
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '300px'
        });

        // Set background color based on type
        const colors = {
            success: '#00b894',
            error: '#d63031',
            info: '#0984e3',
            warning: '#fdcb6e'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new LoveLocker();
});
