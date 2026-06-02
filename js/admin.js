// ============================================
// Admin Panel Functionality
// ============================================

// Check admin authentication
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage !== 'login.html' && isLoggedIn !== 'true') {
        window.location.href = 'login.html';
    }
}

// Initialize admin page based on current page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage !== 'login.html') {
        checkAdminAuth();
    }
    
    if (currentPage === 'dashboard.html') {
        loadDashboardStats();
        loadRecentOrders();
        // Sync theme for admin dashboard
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    } else if (currentPage === 'products.html') {
        loadProductsTable();
        setupProductForm();
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    } else if (currentPage === 'orders.html') {
        loadOrdersTable();
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    } else if (currentPage === 'customers.html') {
        loadCustomersTable();
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    } else if (currentPage === 'login.html') {
        // Add theme sync for admin login page
        if (typeof syncThemeAcrossPages === 'function') {
            syncThemeAcrossPages();
        }
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        });
    }
});

// Load dashboard statistics
function loadDashboardStats() {
    const products = getAdminProducts();
    const orders = getAdminOrders();
    const customers = getAdminCustomers();
    
    const totalProductsEl = document.getElementById('total-products');
    const totalOrdersEl = document.getElementById('total-orders');
    const totalCustomersEl = document.getElementById('total-customers');
    const totalRevenueEl = document.getElementById('total-revenue');
    
    if (totalProductsEl) totalProductsEl.textContent = products.length;
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    if (totalCustomersEl) totalCustomersEl.textContent = customers.length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    if (totalRevenueEl) totalRevenueEl.textContent = `$${totalRevenue.toFixed(2)}`;
}

// Load recent orders table
function loadRecentOrders() {
    const orders = getAdminOrders();
    const recentOrders = orders.slice(-5).reverse();
    const tbody = document.querySelector('#recent-orders-table tbody');
    
    if (tbody) {
        tbody.innerHTML = recentOrders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }
}

// Load products table
function loadProductsTable() {
    const products = getAdminProducts();
    const tbody = document.querySelector('#products-table tbody');
    
    if (tbody) {
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image}" width="50" height="50" style="object-fit: cover; border-radius: 8px;"></td>
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.category}</td>
                <td><span class="status-badge ${product.inStock ? 'status-delivered' : 'status-cancelled'}">${product.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

// Get admin products from localStorage or initialize with default data
function getAdminProducts() {
    const stored = localStorage.getItem('adminProducts');
    if (stored) return JSON.parse(stored);
    
    // Initialize with default products from JSON
    const defaultProducts = [
        { id: 1, name: "Classic Denim Jacket", price: 199.86, category: "mens", image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100", inStock: true, description: "A timeless denim jacket" },
        { id: 2, name: "Sporty Hoodie", price: 159.86, category: "mens", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100", inStock: true, description: "Comfortable sporty hoodie" },
        { id: 3, name: "Wool Blend Coat", price: 199.86, category: "mens", image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=100", inStock: true, description: "Elegant wool blend coat" },
        { id: 4, name: "Formal Blazer", price: 159.86, category: "mens", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100", inStock: true, description: "Sharp formal blazer" },
        { id: 5, name: "Cashmere Sweater", price: 125.89, category: "mens", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100", inStock: true, description: "Luxurious cashmere sweater" }
    ];
    localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
    return defaultProducts;
}

// Get admin orders
function getAdminOrders() {
    const stored = localStorage.getItem('adminOrders');
    if (stored) return JSON.parse(stored);
    
    const defaultOrders = [
        { id: 1001, customerName: "John Doe", total: 359.72, status: "delivered", date: "2024-01-15", items: [] },
        { id: 1002, customerName: "Jane Smith", total: 199.86, status: "processing", date: "2024-01-18", items: [] },
        { id: 1003, customerName: "Mike Johnson", total: 159.86, status: "shipped", date: "2024-01-20", items: [] },
        { id: 1004, customerName: "Sarah Wilson", total: 299.86, status: "pending", date: "2024-01-22", items: [] },
        { id: 1005, customerName: "David Brown", total: 89.86, status: "delivered", date: "2024-01-23", items: [] }
    ];
    localStorage.setItem('adminOrders', JSON.stringify(defaultOrders));
    return defaultOrders;
}

// Get admin customers
function getAdminCustomers() {
    const stored = localStorage.getItem('adminCustomers');
    if (stored) return JSON.parse(stored);
    
    const defaultCustomers = [
        { id: 1, name: "John Doe", email: "john@example.com", orders: 2, totalSpent: 559.58, joinDate: "2024-01-10" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", orders: 1, totalSpent: 199.86, joinDate: "2024-01-15" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com", orders: 1, totalSpent: 159.86, joinDate: "2024-01-18" },
        { id: 4, name: "Sarah Wilson", email: "sarah@example.com", orders: 1, totalSpent: 299.86, joinDate: "2024-01-20" },
        { id: 5, name: "David Brown", email: "david@example.com", orders: 1, totalSpent: 89.86, joinDate: "2024-01-22" }
    ];
    localStorage.setItem('adminCustomers', JSON.stringify(defaultCustomers));
    return defaultCustomers;
}

// Load orders table
function loadOrdersTable() {
    const orders = getAdminOrders();
    const tbody = document.querySelector('#orders-table tbody');
    
    if (tbody) {
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" class="status-select" style="background: ${getStatusColor(order.status)}20; border-color: ${getStatusColor(order.status)}; color: ${getStatusColor(order.status)};">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }
}

// Helper function for status color
function getStatusColor(status) {
    const colors = {
        pending: '#f39c12',
        processing: '#3498db',
        shipped: '#9b59b6',
        delivered: '#2ecc71',
        cancelled: '#e74c3c'
    };
    return colors[status] || '#666';
}

// Load customers table
function loadCustomersTable() {
    const customers = getAdminCustomers();
    const tbody = document.querySelector('#customers-table tbody');
    
    if (tbody) {
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.orders}</td>
                <td>$${customer.totalSpent.toFixed(2)}</td>
                <td>${new Date(customer.joinDate).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }
}

// Edit product
function editProduct(productId) {
    window.location.href = `products.html?edit=${productId}`;
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = getAdminProducts();
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('adminProducts', JSON.stringify(products));
        loadProductsTable();
        showAdminToast('Product deleted successfully');
    }
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    let orders = getAdminOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        showAdminToast(`Order #${orderId} status updated to ${newStatus}`);
        // Refresh the orders table if on orders page
        if (window.location.pathname.includes('orders.html')) {
            loadOrdersTable();
        }
        // Refresh recent orders on dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            loadRecentOrders();
        }
    }
}

// Setup product form (for adding/editing)
function setupProductForm() {
    const form = document.getElementById('product-form');
    if (!form) return;
    
    // Check if editing
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        const products = getAdminProducts();
        const product = products.find(p => p.id == editId);
        if (product) {
            const idField = document.getElementById('product-id');
            const nameField = document.getElementById('product-name');
            const priceField = document.getElementById('product-price');
            const categoryField = document.getElementById('product-category');
            const imageField = document.getElementById('product-image');
            const descField = document.getElementById('product-description');
            const submitBtn = document.querySelector('#product-form button');
            
            if (idField) idField.value = product.id;
            if (nameField) nameField.value = product.name;
            if (priceField) priceField.value = product.price;
            if (categoryField) categoryField.value = product.category;
            if (imageField) imageField.value = product.image;
            if (descField) descField.value = product.description || '';
            if (submitBtn) submitBtn.textContent = 'Update Product';
        }
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const productId = document.getElementById('product-id')?.value;
        const productName = document.getElementById('product-name')?.value;
        const productPrice = document.getElementById('product-price')?.value;
        const productCategory = document.getElementById('product-category')?.value;
        const productImage = document.getElementById('product-image')?.value;
        const productDesc = document.getElementById('product-description')?.value;
        
        if (!productName || !productPrice || !productCategory) {
            showAdminToast('Please fill in all required fields', 'error');
            return;
        }
        
        const product = {
            id: productId ? parseInt(productId) : Date.now(),
            name: productName,
            price: parseFloat(productPrice),
            category: productCategory,
            image: productImage || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100',
            description: productDesc || '',
            inStock: true
        };
        
        let products = getAdminProducts();
        if (productId) {
            const index = products.findIndex(p => p.id == productId);
            if (index !== -1) products[index] = product;
        } else {
            products.push(product);
        }
        
        localStorage.setItem('adminProducts', JSON.stringify(products));
        showAdminToast(productId ? 'Product updated successfully' : 'Product added successfully');
        window.location.href = 'products.html';
    });
}

// Show toast notification for admin
function showAdminToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease forwards;
        font-size: 0.9rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}