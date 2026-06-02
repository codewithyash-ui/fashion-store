// ============================================
// Products Page Functionality
// ============================================

let allProducts = [];
let currentFilters = {
    category: 'all',
    sortBy: 'latest',
    searchTerm: '',
    priceRange: 'all'
};

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('../data/products.json');
        const data = await response.json();
        allProducts = data.products || data;
        window.productsData = allProducts;
        
        // Populate filters and display products
        populateCategories();
        displayProducts();
        setupEventListeners();
        
        // Sync theme after products load
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        loadFallbackProductsList();
    }
}

// Fallback products list
function loadFallbackProductsList() {
    allProducts = [
        { id: 1, name: "Classic Denim Jacket", category: "mens", price: 199.86, originalPrice: 299.86, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400", rating: 4.5, reviews: 128, inStock: true },
        { id: 2, name: "Sporty Hoodie", category: "mens", price: 159.86, originalPrice: 199.86, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", rating: 4.3, reviews: 94, inStock: true },
        { id: 3, name: "Wool Blend Coat", category: "mens", price: 199.86, originalPrice: 299.86, image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400", rating: 4.7, reviews: 56, inStock: true },
        { id: 4, name: "Formal Blazer", category: "mens", price: 159.86, originalPrice: 199.86, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400", rating: 4.6, reviews: 203, inStock: true },
        { id: 5, name: "Cashmere Sweater", category: "mens", price: 125.89, originalPrice: 159.86, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400", rating: 4.8, reviews: 167, inStock: true },
        { id: 6, name: "Leather Jacket", category: "mens", price: 299.86, originalPrice: 399.86, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", rating: 4.9, reviews: 312, inStock: true }
    ];
    window.productsData = allProducts;
    populateCategories();
    displayProducts();
    setupEventListeners();
}

// Populate category filter options
function populateCategories() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;
    
    const categories = [...new Set(allProducts.map(p => p.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('');
}

// Display products based on filters
function displayProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    let filteredProducts = [...allProducts];
    
    // Apply category filter
    if (currentFilters.category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentFilters.category);
    }
    
    // Apply search filter
    if (currentFilters.searchTerm) {
        const term = currentFilters.searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(term) || 
            (p.category && p.category.toLowerCase().includes(term))
        );
    }
    
    // Apply price filter
    if (currentFilters.priceRange !== 'all') {
        const [min, max] = currentFilters.priceRange.split('-').map(Number);
        filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
    }
    
    // Apply sorting
    switch (currentFilters.sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'latest':
        default:
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
    }
    
    // Update results count
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${filteredProducts.length} products`;
    }
    
    // Render products
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc;"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
                <button onclick="resetFilters()" class="btn-primary">Reset Filters</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.originalPrice ? `<span class="sale-badge">Sale</span>` : ''}
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                    <button class="wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}" onclick="toggleWishlist(${product.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="view-btn" onclick="viewProduct(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <div class="product-rating">
                    ${generateRatingStars(product.rating)}
                    <span>(${product.reviews || 0})</span>
                </div>
                <div class="product-price">
                    $${product.price.toFixed(2)}
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Update wishlist button states after rendering
    if (typeof updateWishlistButtons === 'function') {
        updateWishlistButtons();
    }
}

// Generate rating stars
function generateRatingStars(rating) {
    if (!rating) return '<i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

// View product details
function viewProduct(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// Setup event listeners for filters
function setupEventListeners() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const priceFilter = document.getElementById('price-filter');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            displayProducts();
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
            displayProducts();
        });
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', (e) => {
            currentFilters.priceRange = e.target.value;
            displayProducts();
        });
    }
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            currentFilters.searchTerm = searchInput.value;
            displayProducts();
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentFilters.searchTerm = searchInput.value;
                displayProducts();
            }
        });
    }
}

// Reset all filters
function resetFilters() {
    currentFilters = {
        category: 'all',
        sortBy: 'latest',
        searchTerm: '',
        priceRange: 'all'
    };
    
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const priceFilter = document.getElementById('price-filter');
    const searchInput = document.getElementById('search-input');
    
    if (categoryFilter) categoryFilter.value = 'all';
    if (sortFilter) sortFilter.value = 'latest';
    if (priceFilter) priceFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    
    displayProducts();
}

// Initialize products page
if (window.location.pathname.includes('products.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadProducts();
    });
}

// Initialize product details page
if (window.location.pathname.includes('product-details.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadProductDetails();
        // Sync theme when product details loads
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    });
}

// Load product details
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    
    try {
        const response = await fetch('../data/products.json');
        const data = await response.json();
        const products = data.products || data;
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            window.location.href = 'products.html';
            return;
        }
        
        displayProductDetails(product);
        loadRelatedProducts(product.category, productId);
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

// Display product details
function displayProductDetails(product) {
    const container = document.getElementById('product-details-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="product-details">
            <div class="product-gallery">
                <div class="main-image">
                    <img src="${product.image}" alt="${product.name}" id="main-product-image">
                </div>
                <div class="thumbnail-images">
                    ${product.images ? product.images.map(img => `<img src="${img}" alt="${product.name}" onclick="changeMainImage('${img}')">`).join('') : ''}
                </div>
            </div>
            <div class="product-info-details">
                <h1>${product.name}</h1>
                <div class="product-rating-large">
                    ${generateRatingStars(product.rating)}
                    <span>${product.reviews || 0} reviews</span>
                </div>
                <div class="product-price-large">
                    $${product.price.toFixed(2)}
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <p class="product-description">${product.description || 'High-quality fashion product designed for comfort and style.'}</p>
                <div class="product-options">
                    <div class="size-selector">
                        <label>Size:</label>
                        <div class="size-options">
                            ${product.sizes ? product.sizes.map(size => `<button class="size-btn">${size}</button>`).join('') : '<span>Standard</span>'}
                        </div>
                    </div>
                    <div class="color-selector">
                        <label>Color:</label>
                        <div class="color-options">
                            ${product.colors ? product.colors.map(color => `<button class="color-btn" style="background: ${color.toLowerCase()}">${color}</button>`).join('') : ''}
                        </div>
                    </div>
                    <div class="quantity-selector">
                        <label>Quantity:</label>
                        <div class="quantity-controls">
                            <button onclick="decrementQuantity()">-</button>
                            <span id="product-quantity">1</span>
                            <button onclick="incrementQuantity()">+</button>
                        </div>
                    </div>
                </div>
                <div class="product-actions-details">
                    <button class="btn-primary" onclick="addToCart(${product.id}, parseInt(document.getElementById('product-quantity').innerText))">
                        <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                    <button class="btn-outline ${isInWishlist(product.id) ? 'active' : ''}" onclick="toggleWishlist(${product.id})">
                        <i class="fas fa-heart"></i> Wishlist
                    </button>
                </div>
                <div class="product-meta">
                    <p><strong>Category:</strong> ${product.category}</p>
                    <p><strong>Availability:</strong> ${product.inStock !== false ? 'In Stock' : 'Out of Stock'}</p>
                </div>
            </div>
        </div>
    `;
}

// Change main image in gallery
function changeMainImage(imageSrc) {
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) mainImage.src = imageSrc;
}

// Quantity controls
function incrementQuantity() {
    const quantitySpan = document.getElementById('product-quantity');
    if (quantitySpan) {
        let qty = parseInt(quantitySpan.innerText);
        quantitySpan.innerText = qty + 1;
    }
}

function decrementQuantity() {
    const quantitySpan = document.getElementById('product-quantity');
    if (quantitySpan) {
        let qty = parseInt(quantitySpan.innerText);
        if (qty > 1) quantitySpan.innerText = qty - 1;
    }
}

// Load related products
async function loadRelatedProducts(category, currentProductId) {
    try {
        const response = await fetch('../data/products.json');
        const data = await response.json();
        const products = data.products || data;
        const related = products.filter(p => p.category === category && p.id !== currentProductId).slice(0, 4);
        
        const container = document.getElementById('related-products');
        if (container) {
            if (related.length) {
                container.innerHTML = related.map(product => `
                    <div class="product-card" data-product-id="${product.id}">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}">
                            <div class="product-actions">
                                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                                    <i class="fas fa-shopping-bag"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <div class="product-price">$${product.price.toFixed(2)}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p style="text-align: center;">No related products found.</p>';
            }
        }
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}