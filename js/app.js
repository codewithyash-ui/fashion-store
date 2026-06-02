// ============================================
// Main Application Script
// ============================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Initialize Swiper for hero slider
    const heroSwiper = new Swiper('.heroSwiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    });

    // Initialize Swiper for reviews
    const reviewsSwiper = new Swiper('.reviewsSwiper', {
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        }
    });

    // Hide loader after page load
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hide');
        }, 500);
    }

    // ============================================
    // MOBILE MENU TOGGLE - FIXED
    // ============================================
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    
    if (hamburger && navbar) {
        // Toggle menu when hamburger is clicked
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navbar.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navbar.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (navbar.classList.contains('active') && 
                !navbar.contains(event.target) && 
                !hamburger.contains(event.target)) {
                hamburger.classList.remove('active');
                navbar.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                showToast('Thank you for subscribing!');
                this.reset();
            }
        });
    }

    // Update cart and wishlist counts on page load
    updateHeaderCounts();

    // Load products on home page
    loadHomePageProducts();
    
    // Sync theme across pages
    syncThemeAcrossPages();
});

// Show toast notification
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Update header counts (cart and wishlist)
function updateHeaderCounts() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const wishlistCount = wishlist.length;

    const cartCountElement = document.querySelector('.cart-count');
    const wishlistCountElement = document.querySelector('.wishlist-count');

    if (cartCountElement) cartCountElement.textContent = cartCount;
    if (wishlistCountElement) wishlistCountElement.textContent = wishlistCount;
}

// Load products for home page
async function loadHomePageProducts() {
    try {
        const response = await fetch('../data/products.json');
        const products = await response.json();
        
        // Get featured products (first 4)
        const featuredProducts = products.slice(0, 4);
        // Get trending products (next 4)
        const trendingProducts = products.slice(4, 8);

        renderProductGrid(featuredProducts, 'featured-products-grid');
        renderProductGrid(trendingProducts, 'trending-products-grid');
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to dummy data if JSON not found
        loadFallbackProducts();
    }
}

// Render products in grid
function renderProductGrid(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                    <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <div class="product-price">
                    $${product.price}
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // Update wishlist button states
    updateWishlistButtons();
}

// Fallback products if JSON fails to load
function loadFallbackProducts() {
    const fallbackProducts = [
        { id: 1, name: "Classic Denim Jacket", category: "Jackets", price: 199.86, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400", originalPrice: 299.86 },
        { id: 2, name: "Sporty Hoodie", category: "Sports", price: 159.86, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", originalPrice: 199.86 },
        { id: 3, name: "Wool Blend Coat", category: "Coats", price: 199.86, image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400", originalPrice: 299.86 },
        { id: 4, name: "Formal Blazer", category: "Suits", price: 159.86, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400", originalPrice: 199.86 }
    ];
    renderProductGrid(fallbackProducts, 'featured-products-grid');
    renderProductGrid(fallbackProducts, 'trending-products-grid');
}

// ============================================
// Theme Sync Function (Added for Theme Switcher)
// ============================================

// Sync theme across all pages
function syncThemeAcrossPages() {
    const savedTheme = localStorage.getItem('selectedTheme');
    const themes = ['default', 'blue', 'green', 'orange', 'purple'];
    
    if (savedTheme && savedTheme !== 'default') {
        document.body.classList.add(`theme-${savedTheme}`);
    }
    
    // Update active theme button if theme switcher exists
    updateActiveThemeButton(savedTheme || 'default');
}

// Update active theme button state
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

// Apply theme function (can be called from themes.js)
function applyTheme(theme) {
    const themes = ['default', 'blue', 'green', 'orange', 'purple'];
    
    // Remove all theme classes
    themes.forEach(t => {
        if (t !== 'default') {
            document.body.classList.remove(`theme-${t}`);
        }
    });
    
    // Add selected theme class
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', theme);
    
    // Update active button
    updateActiveThemeButton(theme);
}