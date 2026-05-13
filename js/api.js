// ══════════════════════════════════════════════════════════════
//  ANNAPOORNA – PHP BACKEND API CONNECTOR
//  File: js/api.js
//  This module connects the frontend to the PHP/MySQL backend.
//  Import this file AFTER app.js.
//  When PHP backend is running, set USE_PHP_BACKEND = true.
// ══════════════════════════════════════════════════════════════

const USE_PHP_BACKEND = true; // ← Set to TRUE when your PHP server is running
const API_BASE = '/food-system/backend/index.php'; // Adjust path if needed

// ── API REQUEST HELPER ────────────────────────────────────────
async function apiRequest(endpoint, action, method = 'GET', body = null) {
    const url   = `${API_BASE}?endpoint=${endpoint}&action=${action}`;
    const token = localStorage.getItem('sifms_token');
    const opts  = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
    };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    const res  = await fetch(url, opts);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'API error');
    return data.data;
}

// ── AUTH API ──────────────────────────────────────────────────
const AuthAPI = {
    async register(name, email, phone, password) {
        const data = await apiRequest('auth', 'register', 'POST', { name, email, phone, password });
        localStorage.setItem('sifms_token', data.token);
        return data.user;
    },
    async login(email, password) {
        const data = await apiRequest('auth', 'login', 'POST', { email, password });
        localStorage.setItem('sifms_token', data.token);
        return data.user;
    },
    async me() {
        return apiRequest('auth', 'me');
    },
    logout() {
        localStorage.removeItem('sifms_token');
    },
};

// ── FOODS API ─────────────────────────────────────────────────
const FoodsAPI = {
    async list(category = null) {
        const q = category ? `&category=${category}` : '';
        const url = `${API_BASE}?endpoint=foods&action=list${q}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.data;
    },
    async categories() {
        const url = `${API_BASE}?endpoint=foods&action=categories`;
        const res = await fetch(url);
        const data = await res.json();
        return data.data;
    },
    async detail(id) {
        const url = `${API_BASE}?endpoint=foods&action=detail&id=${id}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.data;
    },
    // Admin
    async create(payload) {
        return apiRequest('foods', 'create', 'POST', payload);
    },
    async update(id, payload) {
        return apiRequest('foods', `update&id=${id}`, 'POST', payload);
    },
    async delete(id) {
        return apiRequest('foods', `delete&id=${id}`, 'POST');
    },
};

// ── ORDERS API ────────────────────────────────────────────────
const OrdersAPI = {
    async place(items, paymentMethod, address = '') {
        return apiRequest('orders', 'place', 'POST', { items, payment_method: paymentMethod, address });
    },
    async myOrders() {
        return apiRequest('orders', 'my_orders');
    },
    async detail(id) {
        return apiRequest('orders', `detail&id=${id}`);
    },
    async cancel(id) {
        return apiRequest('orders', `cancel&id=${id}`, 'POST');
    },
    // Admin
    async all(page = 1, status = null) {
        const q = status ? `&status=${status}` : '';
        return apiRequest('orders', `all&page=${page}${q}`);
    },
    async updateStatus(id, status) {
        return apiRequest('orders', `status&id=${id}`, 'POST', { status });
    },
};

// ── REVIEWS API ───────────────────────────────────────────────
const ReviewsAPI = {
    async list(foodId = null, limit = 12) {
        const q = foodId ? `&food_id=${foodId}` : '';
        const url = `${API_BASE}?endpoint=reviews&action=list${q}&limit=${limit}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.data;
    },
    async create(foodId, rating, reviewText) {
        return apiRequest('reviews', 'create', 'POST', {
            food_id: foodId, rating, review_text: reviewText,
        });
    },
    // Admin
    async all(status = null) {
        const q = status ? `&status=${status}` : '';
        return apiRequest('reviews', `all${q}`);
    },
    async delete(id) {
        return apiRequest('reviews', `delete&id=${id}`, 'POST');
    },
    async approve(id, status = 'approved') {
        return apiRequest('reviews', `approve&id=${id}`, 'POST', { status });
    },
};

// ── ADMIN API ─────────────────────────────────────────────────
const AdminAPI = {
    async dashboard() {
        return apiRequest('admin', 'dashboard');
    },
    async users(page = 1, q = null) {
        const qs = q ? `&q=${encodeURIComponent(q)}` : '';
        return apiRequest('admin', `users&page=${page}${qs}`);
    },
    async banUser(id, status) {
        return apiRequest('admin', `ban_user&id=${id}`, 'POST', { status });
    },
    async payments() {
        return apiRequest('admin', 'payments');
    },
    async reports(days = 30) {
        return apiRequest('admin', `reports&days=${days}`);
    },
};

// ══════════════════════════════════════════════════════════════
//  OVERRIDE FRONTEND FUNCTIONS WITH PHP BACKEND CALLS
//  These functions replace the localStorage-based versions in
//  app.js when USE_PHP_BACKEND is true.
// ══════════════════════════════════════════════════════════════
if (USE_PHP_BACKEND) {

    // ── AUTH ────────────────────────────────────────────────────
    window.handleLogin = async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass  = document.getElementById('loginPass').value;
        try {
            const user = await AuthAPI.login(email, pass);
            state.user = user;
            saveState();
            updateAuthUI();
            closeModals();
            showToast(`Welcome back, ${user.name}! 🎉`, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    window.handleRegister = async function(e) {
        e.preventDefault();
        const name  = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const pass  = document.getElementById('regPass').value;
        const pass2 = document.getElementById('regPass2').value;
        if (pass !== pass2) { showToast('Passwords do not match!', 'error'); return; }
        try {
            const user = await AuthAPI.register(name, email, phone, pass);
            state.user = user;
            saveState();
            updateAuthUI();
            closeModals();
            showToast(`Welcome, ${user.name}! 🌟`, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    window.logout = function() {
        AuthAPI.logout();
        state.user = null;
        state.cart = [];
        saveState();
        updateAuthUI();
        renderCart();
        showPage('home');
        showToast('Logged out', 'info');
    };

    // ── MENU ────────────────────────────────────────────────────
    window.openCategory = async function(catSlug) {
        if (!state.user) { openLogin(); showToast('Please login to browse menu', 'info'); return; }
        state.currentCategory = catSlug;
        document.getElementById('menuCatName').textContent = '🍛 Loading...';
        showPage('menu');
        try {
            const foods = await FoodsAPI.list(catSlug);
            // Map PHP response to existing renderFoodGrid format
            window._phpMenuData = {};
            window._phpMenuData[catSlug] = foods.map(f => ({
                id: f.id, name: f.name, emoji: f.emoji, price: parseFloat(f.price),
                desc: f.description, type: f.type,
            }));
            const cat = foods[0];
            document.getElementById('menuCatName').textContent = `${cat?.category_slug || catSlug} Menu`;
            renderFoodGridFromData(catSlug, window._phpMenuData[catSlug]);
        } catch (err) {
            showToast('Failed to load menu: ' + err.message, 'error');
        }
    };

    function renderFoodGridFromData(catId, items) {
        const grid = document.getElementById('foodGrid');
        if (!items || !items.length) { grid.innerHTML = '<p style="padding:40px;text-align:center;color:#9A7B5C">No items available</p>'; return; }
        grid.innerHTML = items.map(item => {
            const inCart = state.cart.find(c => c.id === item.id);
            return `
              <div class="food-card" id="food-card-${item.id}">
                <div class="food-img">
                  <span>${item.emoji}</span>
                  <span class="food-badge ${item.type}">${item.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                </div>
                <div class="food-body">
                  <div class="food-name">${item.name}</div>
                  <div class="food-desc">${item.desc || ''}</div>
                  <div class="food-footer">
                    <div class="food-price">₹${parseFloat(item.price).toFixed(0)} <span>/ plate</span></div>
                    ${inCart ? `<div class="qty-control"><button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button><span class="qty-num">${inCart.qty}</span><button class="qty-btn" onclick="changeQty(${item.id},1)">+</button></div>` : `<button class="add-btn" onclick="addToCartFromData(${item.id},'${catId}')">+</button>`}
                  </div>
                </div>
              </div>`;
        }).join('');
    }

    window.addToCartFromData = function(itemId, catId) {
        const items = window._phpMenuData?.[catId] || [];
        const item  = items.find(i => i.id === itemId);
        if (!item) return;
        const existing = state.cart.find(c => c.id === itemId);
        if (existing) existing.qty++;
        else state.cart.push({ ...item, qty: 1 });
        saveState(); updateCartBadge(); renderCart();
        renderFoodGridFromData(catId, window._phpMenuData[catId]);
        showToast(`${item.name} added! 🛒`, 'success');
    };

    // ── ORDERS ──────────────────────────────────────────────────
    window.placeOrder = async function() {
        if (!selectedPayment) { showToast('Please select a payment method!', 'error'); return; }
        const items = state.cart.map(i => ({ id: i.id, qty: i.qty }));
        try {
            const result = await OrdersAPI.place(items, selectedPayment);
            state.cart = [];
            saveState(); updateCartBadge();
            document.getElementById('payModal').classList.remove('open');
            closeCart();
            await loadMyOrders();
            showPage('orders');
            showToast(`Order ${result.order_code} placed! 🎉`, 'success');
        } catch (err) {
            showToast('Order failed: ' + err.message, 'error');
        }
    };

    async function loadMyOrders() {
        try {
            const orders = await OrdersAPI.myOrders();
            state.orders = orders;
            renderOrdersFromPHP(orders);
        } catch (err) {
            showToast('Could not load orders', 'error');
        }
    }

    function renderOrdersFromPHP(orders) {
        const container = document.getElementById('ordersContainer');
        if (!orders || orders.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#9A7B5C">
              <div style="font-size:4rem">📋</div><p style="font-family:'Playfair Display',serif;font-size:1.1rem;margin-top:16px">No orders yet</p></div>`;
            return;
        }
        const STATUS_LABELS = { pending:'Pending', confirmed:'Confirmed', preparing:'Preparing', out_for_delivery:'Out for Delivery', delivered:'Delivered', cancelled:'Cancelled' };
        container.innerHTML = orders.map(o => `
          <div class="order-card">
            <div class="order-header">
              <div>
                <div class="order-id">📋 ${o.order_code}</div>
                <div style="font-size:0.78rem;color:#9A7B5C;margin-top:4px">${new Date(o.created_at).toLocaleString('en-IN')}</div>
              </div>
              <span class="status-badge status-${o.order_status}">${STATUS_LABELS[o.order_status] || o.order_status}</span>
            </div>
            <div class="order-items-list">${o.items_summary || ''}</div>
            <div class="order-footer">
              <div>
                <span style="font-size:0.8rem;color:#9A7B5C">Payment: </span>
                <span style="font-size:0.85rem;font-weight:600;text-transform:capitalize">${o.payment_method === 'cod' ? 'Cash on Delivery' : o.payment_method?.toUpperCase()}</span>
              </div>
              <div style="font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:#FF6B1A">₹${parseFloat(o.total_amount).toFixed(0)}</div>
            </div>
          </div>`).join('');
    }

    window.renderOrders = function() { loadMyOrders(); };

    // ── REVIEWS ─────────────────────────────────────────────────
    window.submitReview = async function(e) {
        e.preventDefault();
        if (!state.user) { openLogin(); return; }
        if (!selectedRating) { showToast('Please select a rating!', 'error'); return; }
        const foodName = document.getElementById('reviewFood').value;
        const text     = document.getElementById('reviewText').value.trim();
        if (!foodName || !text) { showToast('Please fill all fields!', 'error'); return; }

        // Find food_id by name from loaded data
        try {
            const allFoods = await FoodsAPI.list();
            const food = allFoods.find(f => f.name === foodName);
            if (!food) { showToast('Food not found in database', 'error'); return; }
            await ReviewsAPI.create(food.id, selectedRating, text);
            showToast('Review submitted! ⭐', 'success');
            document.getElementById('reviewForm').reset();
            selectedRating = 0;
            document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
            await loadPHPReviews();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    async function loadPHPReviews() {
        try {
            const reviews = await ReviewsAPI.list(null, 20);
            const grid = document.getElementById('reviewsGrid');
            if (grid) {
                grid.innerHTML = reviews.map(r => `
                  <div class="review-card">
                    <div class="review-header">
                      <div class="review-avatar">${r.user_name?.[0]?.toUpperCase() || '?'}</div>
                      <div class="review-info"><h4>${r.user_name}</h4><div class="food-tag">on ${r.food_name} ${r.food_emoji}</div></div>
                    </div>
                    <div class="stars">${'⭐'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                    <p class="review-text">${r.review_text}</p>
                  </div>`).join('') || '<p style="text-align:center;padding:30px;color:#9A7B5C">No reviews yet</p>';
            }
        } catch (err) {
            console.warn('Reviews load failed:', err.message);
        }
    }

    window.renderReviews = function() { loadPHPReviews(); };

    console.log('✅ PHP Backend connector loaded. API base:', API_BASE);
} else {
    console.log('ℹ️ Using localStorage mode. Set USE_PHP_BACKEND=true in js/api.js to connect to PHP backend.');
}
