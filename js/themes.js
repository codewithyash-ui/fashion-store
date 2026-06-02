// ============================================
// Theme Switcher Functionality - 5 Themes
// ============================================

// Available themes
const themes = ['default', 'blue', 'green', 'orange', 'purple'];

// Load saved theme from localStorage
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && themes.includes(savedTheme)) {
        applyTheme(savedTheme);
    } else {
        applyTheme('default');
    }
}

// Apply theme to body
function applyTheme(theme) {
    // Remove all theme classes
    themes.forEach(t => {
        document.body.classList.remove(`theme-${t}`);
    });
    
    // Add selected theme class (default has no class)
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Update active button state
    updateActiveThemeButton(theme);
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', theme);
}

// Update active button styling
function updateActiveThemeButton(activeTheme) {
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        const themeValue = btn.getAttribute('data-theme');
        if (themeValue === activeTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Initialize theme switcher
function initThemeSwitcher() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const switcher = document.getElementById('theme-switcher');
    const themeBtns = document.querySelectorAll('.theme-btn');
    
    // Load saved theme
    loadSavedTheme();
    
    // Toggle theme switcher visibility
    if (toggleBtn && switcher) {
        toggleBtn.addEventListener('click', () => {
            switcher.classList.toggle('show');
        });
        
        // Close switcher when clicking outside
        document.addEventListener('click', (e) => {
            if (!switcher.contains(e.target) && !toggleBtn.contains(e.target)) {
                switcher.classList.remove('show');
            }
        });
    }
    
    // Add click event to each theme button
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
            
            // Show toast notification
            showThemeToast(theme);
            
            // Close switcher after selection on mobile
            if (window.innerWidth <= 768) {
                switcher.classList.remove('show');
            }
        });
    });
}

// Show theme change notification
function showThemeToast(theme) {
    const themeNames = {
        default: 'Luxury Gold',
        blue: 'Ocean Blue',
        green: 'Forest Green',
        orange: 'Sunset Orange',
        purple: 'Purple Royale'
    };
    
    const toast = document.createElement('div');
    toast.className = 'theme-toast';
    toast.innerHTML = `
        <i class="fas fa-palette"></i>
        <span>Theme changed to ${themeNames[theme]}</span>
    `;
    
    // Add custom styles for theme toast
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        background: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease forwards;
        font-size: 0.9rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Add animation styles if not present
function addThemeAnimationStyles() {
    if (!document.querySelector('#theme-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'theme-animation-styles';
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
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    addThemeAnimationStyles();
    initThemeSwitcher();
});