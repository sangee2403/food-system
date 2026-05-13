// ══════════════════════════════════════════
//  ADMIN PANEL JAVASCRIPT
// ══════════════════════════════════════════

// ── DATA HELPERS ──────────────────────────
function getUsers() { return JSON.parse(localStorage.getItem('sifms_users') || '[]'); }
function getOrders() { return JSON.parse(localStorage.getItem('sifms_orders') || '[]'); }
function getReviews() { return JSON.parse(localStorage.getItem('sifms_reviews') || JSON.stringify(SAMPLE_REVIEWS)); }
function getFoods() { return JSON.parse(localStorage.getItem('sifms_foods') || JSON.stringify(DEFAULT_FOODS)); }
function saveUsers(d) { localStorage.setItem('sifms_users', JSON.stringify(d)); }
function saveOrders(d) { localStorage.setItem('sifms_orders', JSON.stringify(d)); }
function saveFoods(d) { localStorage.setItem('sifms_foods', JSON.stringify(d)); }
function saveReviews(d) { localStorage.setItem('sifms_reviews', JSON.stringify(d)); }

const SAMPLE_REVIEWS = [
  { id: 1, user: 'Kavitha R', food: 'Chicken Biriyani', rating: 5, text: 'Absolutely authentic Chettinad biriyani! The aroma filled my entire house. Perfectly cooked meat.', date: '2024-12-10' },
  { id: 2, user: 'Murugan S', food: 'Masala Dosa', rating: 5, text: 'Best dosa I have had outside my mother\'s kitchen. Perfectly crispy edges, soft center.', date: '2024-12-09' },
  { id: 3, user: 'Priya N', food: 'Filter Coffee', rating: 4, text: 'The filter coffee took me straight to Marina Beach! Rich and strong.', date: '2024-12-08' },
  { id: 4, user: 'Arjun V', food: 'Chicken 65', rating: 5, text: 'Spicy, crispy, absolutely addictive! Whole family loved it.', date: '2024-12-07' },
];

const DEFAULT_FOODS = [
  { id: 1, name: 'Idli', category: 'morning', price: 40, type: 'veg', status: 'active', emoji: '🫓', desc: 'Soft steamed rice cakes' },
  { id: 2, name: 'Masala Dosa', category: 'morning', price: 70, type: 'veg', status: 'active', emoji: '🫓', desc: 'Crispy rice crepe with potato filling' },
  { id: 3, name: 'Medu Vadai', category: 'morning', price: 45, type: 'veg', status: 'active', emoji: '🍩', desc: 'Crispy urad dal fritters' },
  { id: 4, name: 'Filter Coffee', category: 'morning', price: 30, type: 'veg', status: 'active', emoji: '☕', desc: 'Authentic South Indian coffee' },
  { id: 5, name: 'Masala Tea', category: 'morning', price: 25, type: 'veg', status: 'active', emoji: '🍵', desc: 'Spiced ginger cardamom chai' },
  { id: 6, name: 'Chicken Biriyani', category: 'afternoon', price: 180, type: 'non-veg', status: 'active', emoji: '🍛', desc: 'Aromatic Chettinad chicken dum biriyani' },
  { id: 7, name: 'Mutton Biriyani', category: 'afternoon', price: 220, type: 'non-veg', status: 'active', emoji: '🍛', desc: 'Slow-cooked mutton with saffron rice' },
  { id: 8, name: 'Vegetable Biriyani', category: 'afternoon', price: 140, type: 'veg', status: 'active', emoji: '🍛', desc: 'Fragrant vegetable rice' },
  { id: 9, name: 'Chicken 65', category: 'evening', price: 160, type: 'non-veg', status: 'active', emoji: '🍗', desc: 'Spicy crispy fried chicken' },
  { id: 10, name: 'Gobi Manchurian', category: 'evening', price: 130, type: 'veg', status: 'active', emoji: '🥦', desc: 'Crispy cauliflower in sauce' },
  { id: 11, name: 'Chicken Noodles', category: 'evening', price: 150, type: 'non-veg', status: 'active', emoji: '🍜', desc: 'Spicy hakka noodles' },
  { id: 12, name: 'Ice Cream', category: 'night', price: 80, type: 'veg', status: 'active', emoji: '🍦', desc: '2 scoops of premium ice cream' },
  { id: 13, name: 'Gulab Jamun', category: 'night', price: 55, type: 'veg', status: 'active', emoji: '🟤', desc: 'Soft dumplings in rose syrup' },
  { id: 14, name: 'Panneer Butter Masala', category: 'night', price: 170, type: 'veg', status: 'active', emoji: '🧀', desc: 'Rich creamy paneer curry' },
];

// ── AUTH ──────────────────────────────────
function checkAdminAuth() {
  const admin = sessionStorage.getItem('sifms_admin');
  if (!admin) { showAdminLogin(); } else { showAdminPanel(JSON.parse(admin)); }
}

function showAdminLogin() {
  document.getElementById('adminLogin').classList.remove('hidden');
  document.getElementById('adminApp').classList.add('hidden');
}

function doAdminLogin(e) {
  e.preventDefault();

  const u = document.getElementById('adUser').value.trim();
  const p = document.getElementById('adPass').value.trim();

  if (u === 'admin' && p === 'admin123') {

    const admin = {
      username: 'admin',
      name: 'Admin Manager'
    };

    sessionStorage.setItem('sifms_admin', JSON.stringify(admin));

    document.getElementById('adminLogin').style.display = 'none';

    document.getElementById('adminApp').style.display = 'flex';

    showAdminPanel(admin);

    toast('Welcome to Admin Panel! 🎉', 'success');

  } else {

    alert('Invalid Username or Password');

  }
}

function showAdminPanel(admin) {
  document.getElementById('adminLogin').classList.add('hidden');
  document.getElementById('adminApp').classList.remove('hidden');
  document.getElementById('adminName').textContent = admin.name;
  document.getElementById('adminInitial').textContent = admin.name[0];
  loadDashboard();
  switchPanel('dashboard');
}

function adminLogout() {
  sessionStorage.removeItem('sifms_admin');
  sessionStorage.removeItem('sifms_admin_token');  // ← இந்த line இருக்கா?
  showAdminLogin();
}

// ── NAVIGATION ──────────────────────────────
function switchPanel(id) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  const link = document.querySelector(`[data-panel="${id}"]`);
  if (panel) panel.classList.add('active');
  if (link) link.classList.add('active');
  document.getElementById('topbarTitle').textContent = PANEL_TITLES[id] || 'Dashboard';

  // Load data for panel
  const loaders = { dashboard: loadDashboard, users: loadUsers, foods: loadFoods, orders: loadOrders, payments: loadPayments, reviews: loadReviews };
  if (loaders[id]) loaders[id]();
}

const PANEL_TITLES = { dashboard: 'Dashboard', users: 'User Management', foods: 'Food Management', orders: 'Order Management', payments: 'Payment Details', reviews: 'Customer Reviews' };

// ── TOAST ──────────────────────────────────
function toast(msg, type = 'info') {
  const c = document.getElementById('adminToast');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ── DASHBOARD ──────────────────────────────
function loadDashboard() {
  const orders = getOrders();
  const users = getUsers();
  const foods = getFoods();
  const reviews = getReviews();

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

  document.getElementById('statRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statUsers').textContent = users.length;
  document.getElementById('statFoods').textContent = foods.length;

  // Recent orders
  const tbody = document.getElementById('recentOrdersBody');
  const recent = orders.slice(0, 6);
  tbody.innerHTML = recent.length ? recent.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.user || o.email}</td>
      <td>${(o.items || []).map(i => i.name).join(', ').substring(0, 40)}${(o.items?.length > 2) ? '...' : ''}</td>
      <td><strong>₹${o.total || 0}</strong></td>
      <td><span class="badge badge-${o.status}">${o.status}</span></td>
      <td>${o.date ? new Date(o.date).toLocaleDateString('en-IN') : '—'}</td>
    </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;color:#9A7B5C;padding:30px">No orders yet</td></tr>';

  // Bar chart (last 7 days revenue)
  renderBarChart(orders);

  // Category stats
  const catStats = {};
  orders.forEach(o => (o.items || []).forEach(i => { catStats[i.name] = (catStats[i.name] || 0) + i.qty; }));
  const sorted = Object.entries(catStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topList = document.getElementById('topItemsList');
  if (topList) {
    topList.innerHTML = sorted.map(([name, qty], i) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #E8D5C0">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="background:#FF6B1A;color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700">${i+1}</span>
          <span style="font-size:0.88rem;font-weight:500">${name}</span>
        </div>
        <span style="font-size:0.82rem;color:#9A7B5C">${qty} orders</span>
      </div>`).join('') || '<p style="color:#9A7B5C;padding:20px 0;text-align:center">No order data yet</p>';
  }
}

function renderBarChart(orders) {
  const chart = document.getElementById('revenueChart');
  if (!chart) return;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], date: d.toDateString(), rev: 0 };
  });
  orders.forEach(o => {
    if (!o.date) return;
    const ds = new Date(o.date).toDateString();
    const day = days.find(d => d.date === ds);
    if (day && o.status !== 'cancelled') day.rev += o.total || 0;
  });
  const max = Math.max(...days.map(d => d.rev), 1);
  chart.innerHTML = days.map(d => `
    <div class="bar-item">
      <div class="bar-val">₹${d.rev > 999 ? (d.rev/1000).toFixed(1)+'k' : d.rev}</div>
      <div class="bar" style="height:${Math.max(8, (d.rev / max) * 130)}px"></div>
      <div class="bar-label">${d.label}</div>
    </div>`).join('');
}

// ── USERS ──────────────────────────────────
function loadUsers() {
  const users = getUsers();
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = users.length ? users.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td>${u.phone || '—'}</td>
      <td>${u.joined ? new Date(u.joined).toLocaleDateString('en-IN') : '—'}</td>
      <td><span class="badge badge-active">Active</span></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.email}')">Delete</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;color:#9A7B5C;padding:30px">No registered users yet</td></tr>';
  document.getElementById('userCount').textContent = users.length + ' users';
}

function deleteUser(email) {
  if (!confirm('Delete this user?')) return;
  const users = getUsers().filter(u => u.email !== email);
  saveUsers(users);
  loadUsers();
  toast('User deleted', 'success');
}

function searchUsers() {
  const q = document.getElementById('userSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#usersBody tr');
  rows.forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none');
}

// ── FOODS ──────────────────────────────────
let editingFoodId = null;

function loadFoods() {
  const foods = getFoods();
  const tbody = document.getElementById('foodsBody');
  tbody.innerHTML = foods.map(f => `
    <tr>
      <td>${f.emoji || '🍛'} ${f.name}</td>
      <td><span style="text-transform:capitalize">${f.category}</span></td>
      <td>₹${f.price}</td>
      <td><span class="badge" style="background:${f.type==='veg'?'#D4EDDA':'#F8D7DA'};color:${f.type==='veg'?'#155724':'#721C24'}">${f.type}</span></td>
      <td><span class="badge badge-${f.status}">${f.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editFood(${f.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteFood(${f.id})" style="margin-left:4px">Delete</button>
      </td>
    </tr>`).join('');
}

function openAddFood() {
  editingFoodId = null;
  document.getElementById('foodModalTitle').textContent = '➕ Add New Food Item';
  document.getElementById('foodForm').reset();
  document.getElementById('foodModal').classList.add('open');
}

function editFood(id) {
  const food = getFoods().find(f => f.id === id);
  if (!food) return;
  editingFoodId = id;
  document.getElementById('foodModalTitle').textContent = '✏️ Edit Food Item';
  document.getElementById('fName').value = food.name;
  document.getElementById('fCategory').value = food.category;
  document.getElementById('fPrice').value = food.price;
  document.getElementById('fType').value = food.type;
  document.getElementById('fEmoji').value = food.emoji || '';
  document.getElementById('fDesc').value = food.desc || '';
  document.getElementById('fStatus').value = food.status || 'active';
  document.getElementById('foodModal').classList.add('open');
}

function saveFoodItem(e) {
  e.preventDefault();
  const foods = getFoods();
  const item = {
    name: document.getElementById('fName').value,
    category: document.getElementById('fCategory').value,
    price: parseFloat(document.getElementById('fPrice').value),
    type: document.getElementById('fType').value,
    emoji: document.getElementById('fEmoji').value || '🍛',
    desc: document.getElementById('fDesc').value,
    status: document.getElementById('fStatus').value,
  };
  if (editingFoodId) {
    const idx = foods.findIndex(f => f.id === editingFoodId);
    if (idx !== -1) foods[idx] = { ...foods[idx], ...item };
    toast('Food item updated!', 'success');
  } else {
    item.id = Date.now();
    foods.push(item);
    toast('Food item added!', 'success');
  }
  saveFoods(foods);
  loadFoods();
  document.getElementById('foodModal').classList.remove('open');
}

function deleteFood(id) {
  if (!confirm('Delete this food item?')) return;
  saveFoods(getFoods().filter(f => f.id !== id));
  loadFoods();
  toast('Food item deleted', 'success');
}

// ── ORDERS ──────────────────────────────────
function loadOrders() {
  const orders = getOrders();
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = orders.length ? orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.user || '—'}</td>
      <td style="max-width:200px;font-size:0.8rem">${(o.items || []).map(i => `${i.name}×${i.qty}`).join(', ')}</td>
      <td><strong>₹${o.total || 0}</strong></td>
      <td style="text-transform:capitalize">${o.payment === 'cod' ? 'Cash on Delivery' : (o.payment || '—').toUpperCase()}</td>
      <td>
        <select class="form-select" style="padding:5px 8px;font-size:0.78rem;border-radius:6px" onchange="updateOrderStatus('${o.id}', this.value)">
          ${['pending','confirmed','preparing','delivered','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select>
      </td>
      <td>${o.date ? new Date(o.date).toLocaleDateString('en-IN') : '—'}</td>
    </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;color:#9A7B5C;padding:30px">No orders yet</td></tr>';
  document.getElementById('orderCount').textContent = orders.length + ' orders';
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) { orders[idx].status = status; saveOrders(orders); }
  toast(`Order ${orderId} marked as ${status}`, 'success');
}

function filterOrders() {
  const q = document.getElementById('orderSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#ordersBody tr');
  rows.forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none');
}

// ── PAYMENTS ──────────────────────────────────
function loadPayments() {
  const orders = getOrders();
  const tbody = document.getElementById('paymentsBody');
  tbody.innerHTML = orders.length ? orders.map(o => `
    <tr>
      <td><strong>PAY-${o.id?.slice(-6) || '—'}</strong></td>
      <td>${o.id}</td>
      <td>${o.user || '—'}</td>
      <td style="text-transform:capitalize">${o.payment === 'cod' ? '💵 Cash on Delivery' : o.payment === 'phonepe' ? '📱 PhonePe' : o.payment === 'gpay' ? '🔵 Google Pay' : o.payment === 'paytm' ? '💙 Paytm' : (o.payment || '—')}</td>
      <td><strong>₹${o.total || 0}</strong></td>
      <td><span class="badge" style="background:${o.status==='delivered'?'#D4EDDA':o.status==='cancelled'?'#F8D7DA':'#FFF3CD'};color:${o.status==='delivered'?'#155724':o.status==='cancelled'?'#721C24':'#856404'}">${o.status === 'delivered' ? '✅ Received' : o.status === 'cancelled' ? '❌ Refunded' : '⏳ Pending'}</span></td>
      <td>${o.date ? new Date(o.date).toLocaleDateString('en-IN') : '—'}</td>
    </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;color:#9A7B5C;padding:30px">No payment records yet</td></tr>';

  // Payment summary
  const breakdown = { cod: 0, phonepe: 0, gpay: 0, paytm: 0 };
  orders.forEach(o => { if (o.payment && breakdown.hasOwnProperty(o.payment)) breakdown[o.payment] += o.total || 0; });
  document.getElementById('payBreakdown').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:#FFF8F0;border-radius:10px;padding:16px;text-align:center">
        <div style="font-size:1.5rem">💵</div>
        <div style="font-size:0.75rem;color:#9A7B5C;margin:4px 0">Cash on Delivery</div>
        <div style="font-weight:700;color:#FF6B1A">₹${breakdown.cod.toLocaleString()}</div>
      </div>
      <div style="background:#FFF8F0;border-radius:10px;padding:16px;text-align:center">
        <div style="font-size:1.5rem">📱</div>
        <div style="font-size:0.75rem;color:#9A7B5C;margin:4px 0">PhonePe</div>
        <div style="font-weight:700;color:#FF6B1A">₹${breakdown.phonepe.toLocaleString()}</div>
      </div>
      <div style="background:#FFF8F0;border-radius:10px;padding:16px;text-align:center">
        <div style="font-size:1.5rem">🔵</div>
        <div style="font-size:0.75rem;color:#9A7B5C;margin:4px 0">Google Pay</div>
        <div style="font-weight:700;color:#FF6B1A">₹${breakdown.gpay.toLocaleString()}</div>
      </div>
      <div style="background:#FFF8F0;border-radius:10px;padding:16px;text-align:center">
        <div style="font-size:1.5rem">💙</div>
        <div style="font-size:0.75rem;color:#9A7B5C;margin:4px 0">Paytm</div>
        <div style="font-weight:700;color:#FF6B1A">₹${breakdown.paytm.toLocaleString()}</div>
      </div>
    </div>`;
}

// ── REVIEWS ──────────────────────────────────
function loadReviews() {
  const reviews = getReviews();
  const tbody = document.getElementById('reviewsBody');
  tbody.innerHTML = reviews.length ? reviews.map((r, i) => `
    <tr>
      <td>${reviews.length - i}</td>
      <td><strong>${r.user}</strong></td>
      <td>${r.food}</td>
      <td>${'⭐'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
      <td style="max-width:250px;font-size:0.82rem">${r.text?.substring(0, 80)}${r.text?.length > 80 ? '...' : ''}</td>
      <td>${r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—'}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteReview(${i})">Delete</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;color:#9A7B5C;padding:30px">No reviews yet</td></tr>';
  document.getElementById('reviewCount').textContent = reviews.length + ' reviews';

  // Rating distribution
  const dist = [0,0,0,0,0];
  reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
  const maxD = Math.max(...dist, 1);
  document.getElementById('ratingDist').innerHTML = [5,4,3,2,1].map(n => `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="font-size:0.8rem;width:20px;text-align:right">${n}⭐</span>
      <div style="flex:1;background:#F5F0EB;border-radius:4px;height:8px;overflow:hidden">
        <div style="width:${(dist[n-1]/maxD)*100}%;background:#FF6B1A;height:100%;border-radius:4px"></div>
      </div>
      <span style="font-size:0.75rem;color:#9A7B5C;width:20px">${dist[n-1]}</span>
    </div>`).join('');
}

function deleteReview(idx) {
  if (!confirm('Delete this review?')) return;
  const reviews = getReviews();
  reviews.splice(idx, 1);
  saveReviews(reviews);
  loadReviews();
  toast('Review deleted', 'success');
}

function filterReviews() {
  const rating = document.getElementById('reviewRatingFilter').value;
  const rows = document.querySelectorAll('#reviewsBody tr');
  rows.forEach(r => {
    if (!rating) { r.style.display = ''; return; }
    const stars = (r.querySelectorAll('td')[3]?.textContent?.match(/⭐/g) || []).length;
    r.style.display = stars == rating ? '' : 'none';
  });
}

// ── INIT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  document.getElementById('adminLoginForm')?.addEventListener('submit', doAdminLogin);
  document.getElementById('foodForm')?.addEventListener('submit', saveFoodItem);

  // Sidebar links
  document.querySelectorAll('[data-panel]').forEach(el => {
    el.addEventListener('click', () => switchPanel(el.dataset.panel));
  });
});
