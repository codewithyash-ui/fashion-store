// ============================================
// Authentication Functionality
// ============================================

// Get users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Get current logged in user
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Set current user
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    // Redirect to login page or home
    const returnUrl = window.location.pathname.includes('admin') ? '../pages/login.html' : 'login.html';
    window.location.href = returnUrl;
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Register new user
function registerUser(firstName, lastName, email, password, phone = '') {
    const users = getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
        id: Date.now(),
        firstName,
        lastName,
        email,
        password, // In real app, hash this!
        phone,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Registration successful' };
}

// Login user
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        return { success: true, message: 'Login successful' };
    }
    
    // Demo login for testing (any email/password works)
    if (email && password) {
        const demoUser = {
            id: Date.now(),
            firstName: 'Demo',
            lastName: 'User',
            email: email,
            createdAt: new Date().toISOString()
        };
        setCurrentUser(demoUser);
        return { success: true, message: 'Demo login successful' };
    }
    
    return { success: false, message: 'Invalid email or password' };
}

// Initialize auth pages
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Login page
    if (currentPage === 'login.html') {
        const loginForm = document.getElementById('login-form');
        const errorDiv = document.getElementById('login-error');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                const result = loginUser(email, password);
                
                if (result.success) {
                    // Redirect based on referrer or default to home
                    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '../index.html';
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                } else {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = result.message;
                }
            });
        }
    }
    
    // Register page
    if (currentPage === 'register.html') {
        const registerForm = document.getElementById('register-form');
        const errorDiv = document.getElementById('register-error');
        const successDiv = document.getElementById('register-success');
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const firstName = document.getElementById('reg-firstname').value;
                const lastName = document.getElementById('reg-lastname').value;
                const email = document.getElementById('reg-email').value;
                const password = document.getElementById('reg-password').value;
                const confirmPassword = document.getElementById('reg-confirm-password').value;
                const phone = document.getElementById('reg-phone').value;
                
                errorDiv.style.display = 'none';
                successDiv.style.display = 'none';
                
                if (password !== confirmPassword) {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = 'Passwords do not match';
                    return;
                }
                
                if (password.length < 6) {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = 'Password must be at least 6 characters';
                    return;
                }
                
                const result = registerUser(firstName, lastName, email, password, phone);
                
                if (result.success) {
                    successDiv.style.display = 'block';
                    successDiv.textContent = result.message + '! Redirecting to login...';
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = result.message;
                }
            });
        }
    }
    
    // Update UI based on login status
    updateAuthUI();
    
    // Sync theme on auth pages
    if (typeof syncThemeAcrossPages === 'function') {
        syncThemeAcrossPages();
    }
});

// Update header UI based on login status
function updateAuthUI() {
    const user = getCurrentUser();
    const userIcon = document.querySelector('.user-icon');
    
    if (userIcon) {
        if (user) {
            userIcon.innerHTML = `<i class="fas fa-user-check"></i>`;
            userIcon.title = `${user.firstName} ${user.lastName}`;
            // Add logout option on click
            userIcon.style.cursor = 'pointer';
            userIcon.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Do you want to logout?')) {
                    logoutUser();
                }
            });
        } else {
            userIcon.innerHTML = `<i class="fas fa-user"></i>`;
            userIcon.style.cursor = 'pointer';
            userIcon.addEventListener('click', (e) => {
                e.preventDefault();
                // Store current page to redirect back after login
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'pages/login.html';
            });
        }
    }
}

// Protected page check
function requireAuth() {
    if (!isLoggedIn()) {
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Get user display name
function getUserDisplayName() {
    const user = getCurrentUser();
    if (user) {
        return `${user.firstName} ${user.lastName}`;
    }
    return 'Guest';
}

// Update user profile (for future use)
function updateUserProfile(updates) {
    const user = getCurrentUser();
    if (user) {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            saveUsers(users);
            // Update current user
            const { password, ...updatedUser } = users[userIndex];
            setCurrentUser(updatedUser);
            return { success: true, message: 'Profile updated successfully' };
        }
    }
    return { success: false, message: 'User not found' };
}