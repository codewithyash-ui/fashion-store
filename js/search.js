// ============================================
// Search Functionality
// ============================================

let searchProducts = [];
let searchCurrentCategory = 'all';
let searchCurrentQuery = '';

// Load products for search
async function loadSearchProducts() {
    try {
        const response = await fetch('../data/products.json');
        const data = await response.json();
        searchProducts = data.products || data;
        performSearch();
        
        // Sync theme after search loads
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        loadFallbackSearchProducts();
    }
}

// Fallback search products
function loadFallbackSearchProducts() {
    searchProducts = [
        { id: 1, name: "Classic Denim Jacket", category: "mens", price: 199.86, originalPrice: 299.86, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400", rating: 4.5, reviews: 128 },
        { id: 2, name: "Sporty Hoodie", category: "mens", price: 159.86, originalPrice: 199.86, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", rating: 4.3, reviews: 94 },
        { id: 3, name: "Wool Blend Coat", category: "mens", price: 199.86, originalPrice: 299.86, image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400", rating: 4.7, reviews: 56 },
        { id: 4, name: "Floral Summer Dress", category: "womens", price: 89.86, originalPrice: 129.86, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400", rating: 4.4, reviews: 89 },
        { id: 5, name: "Running Shoes", category: "footwear", price: 129.86, originalPrice: 159.86, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", rating: 4.5, reviews: 245 },
        { id: 6, name: "Leather Belt", category: "accessories", price: 39.86, originalPrice: 59.86, image: "https://images.unsplash.com/photo-1553708919-dbe7f8a48d78?w=400", rating: 4.3, reviews: 78 },
        { id: 7, name: "Cashmere Sweater", category: "mens", price: 125.89, originalPrice: 159.86, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400", rating: 4.8, reviews: 167 },
        { id: 8, name: "Designer Handbag", category: "womens", price: 249.86, originalPrice: 349.86, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400", rating: 4.7, reviews: 198 }
    ];
    performSearch();
}

// Perform search based on query and category
function performSearch() {
    let results = [...searchProducts];
    
    // Apply category filter
    if (searchCurrentCategory !== 'all') {
        results = results.filter(p => p.category === searchCurrentCategory);
    }
    
    // Apply search query
    if (searchCurrentQuery) {
        const query = searchCurrentQuery.toLowerCase();
        results = results.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.category && p.category.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }
    
    displaySearchResults(results);
}

// Generate rating stars for search results
function generateSearchRatingStars(rating) {
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

// Display search results
function displaySearchResults(results) {
    const container = document.getElementById('search-results-container');
    if (!container) return;
    
    const resultsCountEl = document.getElementById('results-count');
    if (resultsCountEl) {
        resultsCountEl.textContent = `Found ${results.length} products`;
    }
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3>No products found</h3>
                <p style="color: var(--text-light); margin-top: 10px;">Try searching with different keywords or browse our categories</p>
                <a href="products.html" class="btn-primary" style="margin-top: 20px;">Browse All Products</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="products-grid">
            ${results.map(product => `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        ${product.originalPrice ? `<span class="sale-badge" style="position: absolute; top: 10px; left: 10px; background: var(--secondary-color); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">SALE</span>` : ''}
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
                        <div class="product-rating" style="margin: 8px 0;">
                            ${generateSearchRatingStars(product.rating)}
                            <span style="color: var(--text-light); font-size: 0.8rem;">(${product.reviews || 0})</span>
                        </div>
                        <div class="product-price">
                            $${product.price.toFixed(2)}
                            ${product.originalPrice ? `<span class="original-price" style="text-decoration: line-through; color: var(--text-light); margin-left: 8px;">$${product.originalPrice.toFixed(2)}</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Update wishlist button states after rendering
    if (typeof updateWishlistButtons === 'function') {
        updateWishlistButtons();
    }
}

// Setup search page event listeners
function setupSearchListeners() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const categoryFilters = document.querySelectorAll('.filter-chip');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            searchCurrentQuery = searchInput.value.trim();
            performSearch();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchCurrentQuery = searchInput.value.trim();
                performSearch();
            }
        });
    }
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            categoryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            searchCurrentCategory = filter.dataset.cat;
            performSearch();
        });
    });
    
    // Get query from URL parameter if present
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam && searchInput) {
        searchInput.value = queryParam;
        searchCurrentQuery = queryParam;
        performSearch();
    }
}

// View product function for search results
function viewProduct(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// Clear search function
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    searchCurrentQuery = '';
    searchCurrentCategory = 'all';
    
    // Reset active category filter
    const categoryFilters = document.querySelectorAll('.filter-chip');
    categoryFilters.forEach(filter => {
        if (filter.dataset.cat === 'all') {
            filter.classList.add('active');
        } else {
            filter.classList.remove('active');
        }
    });
    
    performSearch();
}

// Initialize search page
if (window.location.pathname.includes('search.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadSearchProducts();
        setupSearchListeners();
        
        // Sync theme when search loads
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    });
}