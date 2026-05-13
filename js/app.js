// ══════════════════════════════════════════
//  SOUTH INDIAN FOOD MANAGEMENT SYSTEM
//  Main Application JavaScript
// ══════════════════════════════════════════

// ── DATA ──────────────────────────────────
const CATEGORIES = [
  { id: 'morning', name: 'Morning', emoji: '🌅', time: '6:00 AM – 11:00 AM', bg: '#FFF3E0', accent: '#FF8F00' },
  { id: 'afternoon', name: 'Afternoon', emoji: '☀️', time: '11:00 AM – 4:00 PM', bg: '#E8F5E9', accent: '#2E7D32' },
  { id: 'evening', name: 'Evening', emoji: '🌇', time: '4:00 PM – 8:00 PM', bg: '#F3E5F5', accent: '#7B1FA2' },
  { id: 'night', name: 'Night', emoji: '🌙', time: '8:00 PM – 11:00 PM', bg: '#E3F2FD', accent: '#1565C0' },
];

const MENU = {
  morning: [
    { id: 1, name: 'Idli', emoji: '🫓', price: 40, desc: 'Soft steamed rice cakes served with sambar & coconut chutney', type: 'veg' },
    { id: 2, name: 'Masala Dosa', emoji: '🫓', price: 70, desc: 'Crispy rice crepe stuffed with spiced potato filling', type: 'veg' },
    { id: 3, name: 'Medu Vadai', emoji: '🍩', price: 45, desc: 'Crispy urad dal fritters with chutney & sambar', type: 'veg' },
    { id: 4, name: 'Filter Coffee', emoji: '☕', price: 30, desc: 'Authentic South Indian decoction coffee with frothy milk', type: 'veg' },
    { id: 5, name: 'Masala Tea', emoji: '🍵', price: 25, desc: 'Spiced ginger cardamom chai with full-fat milk', type: 'veg' },
    { id: 6, name: 'Rava Upma', emoji: '🍚', price: 55, desc: 'Semolina porridge with vegetables, mustard & curry leaves', type: 'veg' },
    { id: 7, name: 'Pongal', emoji: '🍛', price: 60, desc: 'Creamy rice-lentil porridge with pepper & ghee', type: 'veg' },
    { id: 8, name: 'Poori & Curry', emoji: '🫓', price: 65, desc: 'Deep-fried puffed bread with spiced potato kurma', type: 'veg' },
  ],
  afternoon: [
    { id: 9, name: 'Vegetable Biriyani', emoji: '🍛', price: 140, desc: 'Fragrant basmati rice with seasonal vegetables & whole spices', type: 'veg' },
    { id: 10, name: 'Chicken Biriyani', emoji: '🍛', price: 180, desc: 'Aromatic Chettinad chicken dum biriyani with raita', type: 'non-veg' },
    { id: 11, name: 'Mutton Biriyani', emoji: '🍛', price: 220, desc: 'Slow-cooked tender mutton with saffron basmati', type: 'non-veg' },
    { id: 12, name: 'Plain Rice Meals', emoji: '🍽️', price: 90, desc: 'Full South Indian meal with sambar, rasam & 3 gravies', type: 'veg' },
    { id: 13, name: 'Chicken Curry Rice', emoji: '🍗', price: 150, desc: 'Country chicken curry with steamed rice & papad', type: 'non-veg' },
    { id: 14, name: 'Fish Curry Rice', emoji: '🐟', price: 160, desc: 'Spicy fish curry in tamarind gravy with boiled rice', type: 'non-veg' },
    { id: 15, name: 'Parotta & Salna', emoji: '🫓', price: 80, desc: 'Flaky layered flatbread with tomato-onion salna', type: 'veg' },
    { id: 16, name: 'Egg Rice', emoji: '🍳', price: 110, desc: 'Flavored egg fried rice with sautéed vegetables', type: 'non-veg' },
  ],
  evening: [
    { id: 17, name: 'Bajji Varieties', emoji: '🍢', price: 60, desc: 'Assorted deep-fried fritters with coconut & mint chutney', type: 'veg' },
    { id: 18, name: 'Chicken 65', emoji: '🍗', price: 160, desc: 'Spicy crispy fried chicken cubes with curry leaves', type: 'non-veg' },
    { id: 19, name: 'Gobi Manchurian', emoji: '🥦', price: 130, desc: 'Crispy cauliflower in Indo-Chinese tangy sauce', type: 'veg' },
    { id: 20, name: 'Fried Noodles', emoji: '🍜', price: 120, desc: 'Wok-tossed noodles with vegetables & soy sauce', type: 'veg' },
    { id: 21, name: 'Chicken Noodles', emoji: '🍜', price: 150, desc: 'Spicy chicken hakka noodles with spring onions', type: 'non-veg' },
    { id: 22, name: 'Veg Fried Rice', emoji: '🍚', price: 110, desc: 'Stir-fried basmati rice with colorful vegetables', type: 'veg' },
    { id: 23, name: 'Bread Omelette', emoji: '🍳', price: 65, desc: 'Spiced egg omelette with toast & butter', type: 'non-veg' },
    { id: 24, name: 'Samosa (3 pcs)', emoji: '🫙', price: 45, desc: 'Golden fried pastry pockets with spiced potato filling', type: 'veg' },
  ],
  night: [
    { id: 25, name: 'Chicken Fried Rice', emoji: '🍚', price: 160, desc: 'Aromatic fried rice with tender chicken pieces', type: 'non-veg' },
    { id: 26, name: 'Panneer Butter Masala', emoji: '🧀', price: 170, desc: 'Rich creamy tomato gravy with fresh cottage cheese', type: 'veg' },
    { id: 27, name: 'Egg Biriyani', emoji: '🍛', price: 140, desc: 'Fragrant biriyani with boiled eggs & caramelized onions', type: 'non-veg' },
    { id: 28, name: 'Ice Cream (2 scoops)', emoji: '🍦', price: 80, desc: 'Choice of vanilla, mango, or strawberry with wafer', type: 'veg' },
    { id: 29, name: 'Gulab Jamun', emoji: '🟤', price: 55, desc: 'Soft milk-solid dumplings in warm rose syrup', type: 'veg' },
    { id: 30, name: 'Kesari', emoji: '🟡', price: 50, desc: 'Saffron semolina halwa with cashews & raisins', type: 'veg' },
    { id: 31, name: 'Lassi', emoji: '🥛', price: 65, desc: 'Thick creamy yogurt drink in sweet or mango flavor', type: 'veg' },
    { id: 32, name: 'Tender Coconut', emoji: '🥥', price: 60, desc: 'Fresh young coconut water with malai', type: 'veg' },
  ],
};

const SAMPLE_REVIEWS = [
  { user: 'Kavitha R', food: 'Chicken Biriyani', rating: 5, text: 'Absolutely authentic Chettinad biriyani! The aroma filled my entire house. Perfectly cooked meat and the rice was spot on.', avatar: 'K' },
  { user: 'Murugan S', food: 'Masala Dosa', rating: 5, text: 'Best dosa I have had outside my mother\'s kitchen. Perfectly crispy edges, soft center, and the potato filling was perfectly spiced.', avatar: 'M' },
  { user: 'Priya N', food: 'Filter Coffee', rating: 4, text: 'The filter coffee took me straight to Marina Beach! Rich, strong, and that perfect frothy top. Will keep ordering.', avatar: 'P' },
  { user: 'Arjun V', food: 'Chicken 65', rating: 5, text: 'Spicy, crispy, absolutely addictive! The curry leaves add that special touch. My whole family loved it.', avatar: 'A' },
  { user: 'Lakshmi T', food: 'Medu Vadai', rating: 4, text: 'Crispy on the outside, soft and fluffy inside. The coconut chutney was a perfect accompaniment. Fresh and hot delivery!', avatar: 'L' },
  { user: 'Senthil K', food: 'Panneer Butter Masala', rating: 5, text: 'Restaurant quality gravy at home! The paneer was soft and fresh. Perfect with the parotta they delivered alongside.', avatar: 'S' },
];

// ── STATE ──────────────────────────────────
const state = {
  user: null,
  cart: [],
  currentCategory: null,
  reviews: [...SAMPLE_REVIEWS],
  orders: [],
};

// ── UTILITIES ──────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function formatCurrency(n) { return '₹' + n.toFixed(0); }

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const total = state.cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

function getCartTotal() {
  return state.cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function saveState() {
  localStorage.setItem('sifms_user', JSON.stringify(state.user));
  localStorage.setItem('sifms_cart', JSON.stringify(state.cart));
  localStorage.setItem('sifms_orders', JSON.stringify(state.orders));
  localStorage.setItem('sifms_reviews', JSON.stringify(state.reviews));
}

function loadState() {
  try {
    const u = localStorage.getItem('sifms_user');
    const c = localStorage.getItem('sifms_cart');
    const o = localStorage.getItem('sifms_orders');
    const r = localStorage.getItem('sifms_reviews');
    if (u) state.user = JSON.parse(u);
    if (c) state.cart = JSON.parse(c);
    if (o) state.orders = JSON.parse(o);
    if (r) state.reviews = JSON.parse(r);
  } catch(e) {}
}

// ── NAVIGATION ──────────────────────────────
function showPage(id) {
  document.querySelectorAll('[data-page]').forEach(p => p.classList.add('hidden'));
  const page = document.getElementById('page-' + id);
  if (page) { page.classList.remove('hidden'); page.classList.add('page'); }
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.nav === id);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── AUTH ──────────────────────────────────
function openLogin() {
  document.getElementById('modalLogin').classList.add('open');
  document.getElementById('modalRegister').classList.remove('open');
}
function openRegister() {
  document.getElementById('modalRegister').classList.add('open');
  document.getElementById('modalLogin').classList.remove('open');
}
function closeModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const users = JSON.parse(localStorage.getItem('sifms_users') || '[]');
  const user = users.find(u => u.email === email && u.password === pass);
  if (!user) { showToast('Invalid email or password', 'error'); return; }
  state.user = { name: user.name, email: user.email, phone: user.phone };
  saveState();
  updateAuthUI();
  closeModals();
  showToast(`Welcome back, ${user.name}! 🎉`, 'success');
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  if (pass !== pass2) { showToast('Passwords do not match!', 'error'); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
  const users = JSON.parse(localStorage.getItem('sifms_users') || '[]');
  if (users.find(u => u.email === email)) { showToast('Email already registered!', 'error'); return; }
  users.push({ name, email, phone, password: pass, joined: new Date().toISOString() });
  localStorage.setItem('sifms_users', JSON.stringify(users));
  state.user = { name, email, phone };
  saveState();
  updateAuthUI();
  closeModals();
  showToast(`Welcome, ${name}! Your account is ready 🌟`, 'success');
}

function logout() {
  state.user = null;
  state.cart = [];
  saveState();
  updateAuthUI();
  renderCart();
  showPage('home');
  showToast('Logged out successfully', 'info');
}

function updateAuthUI() {
  const loggedIn = !!state.user;
  document.getElementById('navAuthButtons').classList.toggle('hidden', loggedIn);
  document.getElementById('navUserMenu').classList.toggle('hidden', !loggedIn);
  if (loggedIn) {
    document.getElementById('navUserName').textContent = state.user.name.split(' ')[0];
    document.getElementById('navUserInitial').textContent = state.user.name[0].toUpperCase();
  }
  updateCartBadge();
}

// ── CATEGORIES ──────────────────────────────
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = CATEGORIES.map(cat => {
    const items = MENU[cat.id] || [];
    return `
      <div class="category-card" onclick="openCategory('${cat.id}')">
        <span class="cat-emoji">${cat.emoji}</span>
        <div class="cat-name">${cat.name}</div>
        <div class="cat-time">${cat.time}</div>
        <div class="cat-count">${items.length} delicious items</div>
        <span class="cat-arrow">→</span>
      </div>`;
  }).join('');
}

function openCategory(catId) {
  if (!state.user) { openLogin(); showToast('Please login to browse menu', 'info'); return; }
  state.currentCategory = catId;
  const cat = CATEGORIES.find(c => c.id === catId);
  document.getElementById('menuCatName').textContent = `${cat.emoji} ${cat.name} Menu`;
  document.getElementById('menuCatDesc').textContent = `Available ${cat.time}`;
  renderFoodGrid(catId);
  showPage('menu');
}

function renderFoodGrid(catId) {
  const items = MENU[catId] || [];
  const grid = document.getElementById('foodGrid');
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
          <div class="food-desc">${item.desc}</div>
          <div class="food-footer">
            <div class="food-price">${formatCurrency(item.price)} <span>/ plate</span></div>
            ${inCart ? renderQtyControl(item.id, inCart.qty) : `<button class="add-btn" onclick="addToCart(${item.id}, '${catId}')">+</button>`}
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderQtyControl(id, qty) {
  return `<div class="qty-control">
    <button class="qty-btn" onclick="changeQty(${id}, -1)">−</button>
    <span class="qty-num">${qty}</span>
    <button class="qty-btn" onclick="changeQty(${id}, 1)">+</button>
  </div>`;
}

// ── CART ──────────────────────────────────
function addToCart(itemId, catId) {
  const items = MENU[catId] || Object.values(MENU).flat();
  const item = items.find(i => i.id === itemId) || Object.values(MENU).flat().find(i => i.id === itemId);
  if (!item) return;
  const existing = state.cart.find(c => c.id === itemId);
  if (existing) { existing.qty++; }
  else { state.cart.push({ ...item, qty: 1 }); }
  saveState(); updateCartBadge(); renderCart();
  refreshFoodCard(itemId);
  showToast(`${item.name} added to cart! 🛒`, 'success');
}

function changeQty(itemId, delta) {
  const idx = state.cart.findIndex(c => c.id === itemId);
  if (idx === -1) return;
  state.cart[idx].qty += delta;
  if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
  saveState(); updateCartBadge(); renderCart();
  if (state.currentCategory) refreshFoodCard(itemId);
}

function refreshFoodCard(itemId) {
  const catId = state.currentCategory;
  if (!catId) return;
  const item = MENU[catId]?.find(i => i.id === itemId);
  if (!item) return;
  const card = document.getElementById('food-card-' + itemId);
  if (!card) return;
  const inCart = state.cart.find(c => c.id === itemId);
  const footer = card.querySelector('.food-footer');
  const btnArea = footer.querySelector('.add-btn, .qty-control');
  if (btnArea) btnArea.remove();
  const div = document.createElement('div');
  div.innerHTML = inCart ? renderQtyControl(itemId, inCart.qty) : `<button class="add-btn" onclick="addToCart(${itemId}, '${catId}')">+</button>`;
  footer.appendChild(div.firstChild);
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartPanel').classList.add('open');
  renderCart();
}
function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartPanel').classList.remove('open');
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (state.cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Your cart is empty</p><p style="font-size:0.8rem;margin-top:8px;color:#9A7B5C">Browse our menu and add your favourites!</p></div>`;
    footer.classList.add('hidden');
    return;
  }
  footer.classList.remove('hidden');
  const subtotal = getCartTotal();
  const delivery = 30;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + gst;
  container.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatCurrency(item.price)} × ${item.qty} = ${formatCurrency(item.price * item.qty)}</div>
      </div>
      <div class="qty-control" style="gap:6px">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)" style="width:26px;height:26px">−</button>
        <span class="qty-num" style="font-size:0.85rem">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)" style="width:26px;height:26px">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>`).join('');
  document.getElementById('cartSubtotal').textContent = formatCurrency(subtotal);
  document.getElementById('cartDelivery').textContent = formatCurrency(delivery);
  document.getElementById('cartGST').textContent = formatCurrency(gst);
  document.getElementById('cartTotal').textContent = formatCurrency(total);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(c => c.id !== id);
  saveState(); updateCartBadge(); renderCart();
  if (state.currentCategory) renderFoodGrid(state.currentCategory);
}

// ── PAYMENT / CHECKOUT ──────────────────────
let selectedPayment = '';

function openPayment() {
  if (state.cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
  if (!state.user) { closeCart(); openLogin(); return; }
  document.getElementById('payModal').classList.add('open');
  document.getElementById('payTotal').textContent = formatCurrency(getCartTotal() + 30 + Math.round(getCartTotal() * 0.05));
  selectedPayment = '';
  document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
  document.getElementById('upiField').classList.remove('show');
}

function selectPayment(method) {
  selectedPayment = method;
  document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.payment-opt').forEach(o => { if (o.dataset.method === method) o.classList.add('selected'); });
  const upiField = document.getElementById('upiField');
  upiField.classList.toggle('show', ['phonepe', 'gpay', 'paytm'].includes(method));
}

function placeOrder() {
  if (!selectedPayment) { showToast('Please select a payment method!', 'error'); return; }
  const subtotal = getCartTotal();
  const delivery = 30;
  const gst = Math.round(subtotal * 0.05);
  const order = {
    id: 'ORD' + Date.now(),
    items: [...state.cart],
    subtotal, delivery, gst,
    total: subtotal + delivery + gst,
    payment: selectedPayment,
    status: 'confirmed',
    date: new Date().toISOString(),
    user: state.user.name,
    email: state.user.email,
  };
  state.orders.unshift(order);
  state.cart = [];
  saveState(); updateCartBadge();
  document.getElementById('payModal').classList.remove('open');
  closeCart();
  renderOrders();
  showPage('orders');
  showToast(`Order ${order.id} placed successfully! 🎉`, 'success');
}

// ── ORDERS ──────────────────────────────────
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', delivered: 'Delivered', cancelled: 'Cancelled' };

function renderOrders() {
  const container = document.getElementById('ordersContainer');
  const myOrders = state.orders.filter(o => o.email === state.user?.email);
  if (myOrders.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#9A7B5C">
      <div style="font-size:4rem;margin-bottom:16px">📋</div>
      <p style="font-size:1.1rem;font-family:'Playfair Display',serif;margin-bottom:8px">No orders yet</p>
      <p style="font-size:0.85rem">Your delicious orders will appear here</p>
    </div>`;
    return;
  }
  container.innerHTML = myOrders.map(o => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <div class="order-id">📋 ${o.id}</div>
          <div style="font-size:0.78rem;color:#9A7B5C;margin-top:4px">${new Date(o.date).toLocaleString('en-IN')}</div>
        </div>
        <span class="status-badge status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span>
      </div>
      <div class="order-items-list">
        ${o.items.map(i => `${i.emoji} ${i.name} × ${i.qty}`).join('  •  ')}
      </div>
      <div class="order-footer">
        <div>
          <span style="font-size:0.8rem;color:#9A7B5C">Payment: </span>
          <span style="font-size:0.85rem;font-weight:600;text-transform:capitalize">${o.payment === 'cod' ? 'Cash on Delivery' : o.payment.toUpperCase()}</span>
        </div>
        <div style="font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:#FF6B1A">₹${o.total}</div>
      </div>
    </div>`).join('');
}

// ── REVIEWS ──────────────────────────────────
let selectedRating = 0;

function renderReviews() {
  const grid = document.getElementById('reviewsGrid');
  grid.innerHTML = state.reviews.slice(-9).reverse().map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${r.avatar || r.user[0]}</div>
        <div class="review-info">
          <h4>${r.user}</h4>
          <div class="food-tag">on ${r.food}</div>
        </div>
      </div>
      <div class="stars">${'⭐'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <p class="review-text">${r.text}</p>
    </div>`).join('');
}

function setRating(n) {
  selectedRating = n;
  document.querySelectorAll('.star-btn').forEach((btn, i) => btn.classList.toggle('active', i < n));
}

function submitReview(e) {
  e.preventDefault();
  if (!state.user) { openLogin(); return; }
  if (!selectedRating) { showToast('Please select a star rating!', 'error'); return; }
  const food = document.getElementById('reviewFood').value;
  const text = document.getElementById('reviewText').value.trim();
  if (!food || !text) { showToast('Please fill all fields!', 'error'); return; }
  state.reviews.push({ user: state.user.name, food, rating: selectedRating, text, avatar: state.user.name[0].toUpperCase(), date: new Date().toISOString() });
  saveState(); renderReviews();
  document.getElementById('reviewForm').reset();
  selectedRating = 0;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
  showToast('Thank you for your review! ⭐', 'success');
}

// ── PROFILE ──────────────────────────────────
function renderProfile() {
  if (!state.user) { openLogin(); return; }
  document.getElementById('profileName').textContent = state.user.name;
  document.getElementById('profileEmail').textContent = state.user.email;
  document.getElementById('profilePhone').textContent = state.user.phone || '—';
  document.getElementById('profileInitial').textContent = state.user.name[0].toUpperCase();
  const myOrders = state.orders.filter(o => o.email === state.user.email);
  document.getElementById('profileOrderCount').textContent = myOrders.length;
  document.getElementById('profileSpend').textContent = formatCurrency(myOrders.reduce((s, o) => s + o.total, 0));
  const myReviews = state.reviews.filter(r => r.user === state.user.name);
  document.getElementById('profileReviewCount').textContent = myReviews.length;
}

// ── INIT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderCategories();
  renderReviews();
  updateAuthUI();

  // Loading screen
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }
  }, 1200);

  // Nav clicks
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const page = el.dataset.nav;
      if (page === 'orders') { if (!state.user) { openLogin(); return; } renderOrders(); }
      if (page === 'profile') { if (!state.user) { openLogin(); return; } renderProfile(); }
      if (page === 'reviews') renderReviews();
      showPage(page);
    });
  });

  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('reviewForm')?.addEventListener('submit', submitReview);

  // Click outside modal to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModals(); });
  });

  showPage('home');
});
