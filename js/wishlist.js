// ============================================
// Wishlist Functionality
// ============================================

// Get wishlist from localStorage
function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateHeaderCounts();
    updateWishlistCount();
}

// Toggle wishlist item
function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const index = wishlist.indexOf(productId);
    
    // Get product name for toast message
    let productName = '';
    if (window.productsData) {
        const product = window.productsData.find(p => p.id === productId);
        productName = product ? product.name : 'Product';
    } else {
        productName = getDummyProductName(productId);
    }
    
    if (index === -1) {
        wishlist.push(productId);
        showToast(`❤️ Added ${productName} to wishlist`);
    } else {
        wishlist.splice(index, 1);
        showToast(`💔 Removed ${productName} from wishlist`);
    }
    
    saveWishlist(wishlist);
    updateWishlistButtons();
    
    // Refresh wishlist page if on wishlist page
    if (window.location.pathname.includes('wishlist.html')) {
        displayWishlistItems();
    }
}

// Check if product is in wishlist
function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.includes(productId);
}

// Update all wishlist button states
function updateWishlistButtons() {
    const wishlist = getWishlist();
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productCard = btn.closest('.product-card');
        if (productCard) {
            const productId = parseInt(productCard.dataset.productId);
            if (wishlist.includes(productId)) {
                btn.innerHTML = '<i class="fas fa-heart"></i>';
                btn.classList.add('active');
            } else {
                btn.innerHTML = '<i class="far fa-heart"></i>';
                btn.classList.remove('active');
            }
        }
    });
}

// Update wishlist count display
function updateWishlistCount() {
    const wishlist = getWishlist();
    const count = wishlist.length;
    const wishlistCountElements = document.querySelectorAll('.wishlist-count');
    wishlistCountElements.forEach(el => {
        if (el) el.textContent = count;
    });
}

// Display wishlist items on wishlist page
function displayWishlistItems() {
    const container = document.getElementById('wishlist-items-container');
    if (!container) return;
    
    const wishlist = getWishlist();
    
    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-wishlist">
                <i class="far fa-heart" style="font-size: 4rem; color: #ccc;"></i>
                <h3>Your wishlist is empty</h3>
                <p>Save your favorite items here.</p>
                <a href="products.html" class="btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    // Load products and display wishlist items
    fetch('../data/products.json')
        .then(response => response.json())
        .then(data => {
            const products = data.products || data;
            const wishlistProducts = products.filter(p => wishlist.includes(p.id));
            container.innerHTML = wishlistProducts.map(product => `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <div class="product-actions">
                            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                                <i class="fas fa-shopping-bag"></i> Add to Cart
                            </button>
                            <button class="wishlist-btn active" onclick="toggleWishlist(${product.id})">
                                <i class="fas fa-heart"></i>
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
            
            // Update wishlist button states after rendering
            updateWishlistButtons();
        })
        .catch((error) => {
            console.error('Error loading wishlist items:', error);
            container.innerHTML = `
                <div class="empty-wishlist">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ccc;"></i>
                    <h3>Unable to load wishlist</h3>
                    <p>Please try again later.</p>
                    <a href="products.html" class="btn-primary">Browse Products</a>
                </div>
            `;
        });
}

// Helper function for dummy product name
function getDummyProductName(id) {
    const names = {
        1: "Classic Denim Jacket",
        2: "Sporty Hoodie", 
        3: "Wool Blend Coat",
        4: "Formal Blazer",
        5: "Cashmere Sweater",
        6: "Leather Jacket"
    };
    return names[id] || "Product";
}

// Initialize wishlist page
if (window.location.pathname.includes('wishlist.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        displayWishlistItems();
        // Sync theme when wishlist loads
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    });
}