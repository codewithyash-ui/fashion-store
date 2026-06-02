// Checkout functionality
document.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
    
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            placeOrder();
        });
    }
});

function displayOrderSummary() {
    const cart = getCart();
    const subtotal = getCartTotal();
    const shipping = subtotal > 100 ? 0 : 10;
    
    const container = document.getElementById('order-items-list');
    if (container) {
        container.innerHTML = cart.map(item => `
            <div class="order-item"><img src="${item.image}" alt="${item.name}"><div><p>${item.name}</p><p>Qty: ${item.quantity}</p><p>$${(item.price * item.quantity).toFixed(2)}</p></div></div>
        `).join('');
    }
    
    document.getElementById('order-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('order-shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    document.getElementById('order-total').textContent = `$${(subtotal + shipping).toFixed(2)}`;
}

function placeOrder() {
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const pincode = document.getElementById('pincode').value;
    const paymentMethod = document.getElementById('selected-payment').value;
    
    if (!fullName || !email || !address || !city) {
        alert('Please fill in all required fields');
        return;
    }
    
    const cart = getCart();
    const subtotal = getCartTotal();
    const shipping = subtotal > 100 ? 0 : 10;
    const order = {
        id: Date.now(),
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: { address, city, state, pincode },
        items: cart,
        subtotal: subtotal,
        shipping: shipping,
        total: subtotal + shipping,
        paymentMethod: paymentMethod,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    // Save order
    let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    orders.unshift(order);
    localStorage.setItem('adminOrders', JSON.stringify(orders));
    
    // Save customer
    let customers = JSON.parse(localStorage.getItem('adminCustomers') || '[]');
    if (!customers.find(c => c.email === email)) {
        customers.push({
            id: Date.now(),
            name: fullName,
            email: email,
            orders: 1,
            totalSpent: order.total,
            joinDate: new Date().toISOString()
        });
        localStorage.setItem('adminCustomers', JSON.stringify(customers));
    }
    
    // Clear cart
    localStorage.setItem('cart', '[]');
    showToast('Order placed successfully!');
    window.location.href = 'order-success.html';
}