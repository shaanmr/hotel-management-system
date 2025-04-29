// Authentication System
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.init();
    }

    init() {
        // Check if user is already logged in
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.isAuthenticated = true;
            this.updateUI();
        }
    }

    login(email, password) {
        return new Promise((resolve, reject) => {
            const user = this.users.find(u => u.email === email && u.password === password);
            if (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.updateUI();
                resolve(user);
            } else {
                reject(new Error('Invalid email or password'));
            }
        });
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('currentUser');
        this.updateUI();
        window.location.href = 'login.html';
    }

    register(userData) {
        return new Promise((resolve, reject) => {
            // Check if user already exists
            if (this.users.some(u => u.email === userData.email)) {
                reject(new Error('Email already registered'));
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                role: 'user',
                createdAt: new Date().toISOString()
            };

            // Add to users array
            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));

            // Auto login after registration
            this.currentUser = newUser;
            this.isAuthenticated = true;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            this.updateUI();
            resolve(newUser);
        });
    }

    updateUser(userData) {
        if (!this.isAuthenticated) {
            throw new Error('User not authenticated');
        }

        // Find and update user in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Update user data
        this.users[userIndex] = {
            ...this.users[userIndex],
            ...userData,
            // Preserve essential fields
            id: this.currentUser.id,
            role: this.currentUser.role,
            password: this.currentUser.password
        };

        // Update current user
        this.currentUser = this.users[userIndex];

        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateUI();
        return this.currentUser;
    }

    updateUI() {
        // Update navigation based on auth status
        const loginBtn = document.querySelector('.login-btn');
        const profileLink = document.querySelector('a[href="profile.html"]');
        
        if (this.isAuthenticated) {
            if (loginBtn) {
                loginBtn.textContent = 'Logout';
                loginBtn.href = '#';
                loginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
            if (profileLink) {
                profileLink.style.display = 'block';
            }
        } else {
            if (loginBtn) {
                loginBtn.textContent = 'Login';
                loginBtn.href = 'login.html';
            }
            if (profileLink) {
                profileLink.style.display = 'none';
            }
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Initialize auth system
const auth = new Auth();

// Handle login form submission
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await auth.login(email, password);
            window.location.href = 'profile.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Handle registration form submission
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password')
        };

        try {
            await auth.register(userData);
            window.location.href = 'profile.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Handle forgot password form submission
const resetPasswordForm = document.getElementById('reset-password-form');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = resetPasswordForm.querySelector('input[type="email"]').value;
        // In a real application, this would send a reset password email
        alert('Password reset link has been sent to your email.');
        const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
        if (modal) {
            modal.hide();
        }
    });
}

// Protect profile page
if (window.location.pathname.includes('profile.html')) {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Update UI on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.updateUI();
}); 