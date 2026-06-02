// ============================================
// Cart Functionality
// ============================================

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateHeaderCounts();
    updateCartCount();
}

// Add item to cart
function addToCart(productId, quantity = 1) {
    // First try to get product from global products data
    let product = null;
    
    // Try to get from window.products if available
    if (window.productsData) {
        product = window.productsData.find(p => p.id === productId);
    }
    
    // If not found, create a dummy product for demo
    if (!product) {
        product = getDummyProduct(productId);
    }
    
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
        showToast(`Updated ${product.name} quantity`);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
        showToast(`Added ${product.name} to cart`);
    }

    saveCart(cart);
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    
    if (item) {
        showToast(`Removed ${item.name} from cart`);
    }
    
    // Refresh cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = newQuantity;
        saveCart(cart);
        
        // Refresh cart display if on cart page
        if (window.location.pathname.includes('cart.html')) {
            displayCartItems();
        }
    }
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart count display
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        if (el) el.textContent = count;
    });
}

// Display cart items on cart page
function displayCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag" style="font-size: 4rem; color: #ccc;"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any items yet.</p>
                <a href="products.html" class="btn-primary">Continue Shopping</a>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    if (cartSummary) cartSummary.style.display = 'block';
    
    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="qty-btn">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="qty-btn">+</button>
                </div>
                <button onclick="removeFromCart(${item.id})" class="remove-btn">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `).join('');
    
    // Update summary
    const subtotal = getCartTotal();
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;
    
    const subtotalEl = document.getElementById('cart-subtotal');
    const shippingEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-total');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// Get dummy product for demo
function getDummyProduct(id) {
    const dummyProducts = {
        1: { id: 1, name: "Classic Denim Jacket", price: 199.86, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400" },
        2: { id: 2, name: "Sporty Hoodie", price: 159.86, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400" },
        3: { id: 3, name: "Wool Blend Coat", price: 199.86, image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400" },
        4: { id: 4, name: "Formal Blazer", price: 159.86, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
        5: { id: 5, name: "Cashmere Sweater", price: 125.89, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400" },
        6: { id: 6, name: "Leather Jacket", price: 299.86, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" }
    };
    return dummyProducts[id] || null;
}

// Initialize cart page
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        displayCartItems();
        // Sync theme when cart loads
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    });
}