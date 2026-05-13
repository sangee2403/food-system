// ══════════════════════════════════════════════════════════════
//  M.S. Pandi – ADMIN PHP API CONNECTOR
//  File: js/admin-api.js
//  Overrides localStorage-based admin functions with PHP API calls.
//  Set USE_PHP_ADMIN = true when your backend is running.
// ══════════════════════════════════════════════════════════════

const USE_PHP_ADMIN = true; // ← Set to TRUE when PHP server is running
const ADMIN_API = '/food-system/backend/index.php';

async function adminApiReq(endpoint, action, method = 'GET', body = null) {
    const token = sessionStorage.getItem('sifms_admin_token');
    const url   = `${ADMIN_API}?endpoint=${endpoint}&action=${action}`;
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

if (USE_PHP_ADMIN) {

    // ── ADMIN LOGIN ──────────────────────────────────────────────
    window.doAdminLogin = async function(e) {
        e.preventDefault();
        const email = document.getElementById('adUser').value;   // use email field for admin
        const pass  = document.getElementById('adPass').value;
        try {
            // Use auth API – admin account has role=admin in DB
            const url  = `${ADMIN_API}?endpoint=auth&action=login`;
            const res  = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            if (data.data.user.role !== 'admin') throw new Error('Not an admin account');
            sessionStorage.setItem('sifms_admin_token', data.data.token);
            showAdminPanel(data.data.user);
            toast('Welcome to Admin Panel! 🎉', 'success');
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    // ── DASHBOARD ────────────────────────────────────────────────
    window.loadDashboard = async function() {
        try {
            const d = await adminApiReq('admin', 'dashboard');
            const c = d.counts;
            document.getElementById('statRevenue').textContent = '₹' + parseFloat(c.total_revenue).toLocaleString('en-IN');
            document.getElementById('statOrders').textContent  = c.total_orders;
            document.getElementById('statUsers').textContent   = c.total_users;
            document.getElementById('statFoods').textContent   = c.total_foods;

            // Bar chart from PHP data
            const chart = document.getElementById('revenueChart');
            if (chart && d.rev7?.length) {
                const max = Math.max(...d.rev7.map(r => r.revenue), 1);
                chart.innerHTML = d.rev7.map(r => {
                    const day = new Date(r.day).toLocaleDateString('en-IN', { weekday: 'short' });
                    return `<div class="bar-item">
                      <div class="bar-val">₹${parseFloat(r.revenue) > 999 ? (r.revenue/1000).toFixed(1)+'k' : Math.round(r.revenue)}</div>
                      <div class="bar" style="height:${Math.max(8,(r.revenue/max)*130)}px"></div>
                      <div class="bar-label">${day}</div>
                    </div>`;
                }).join('');
            }

            // Top items
            const topList = document.getElementById('topItemsList');
            if (topList && d.top5?.length) {
                topList.innerHTML = d.top5.map((item, i) => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #E8D5C0">
                    <div style="display:flex;align-items:center;gap:10px">
                      <span style="background:#FF6B1A;color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700">${i+1}</span>
                      <span style="font-size:0.88rem">${item.emoji} ${item.name}</span>
                    </div>
                    <span style="font-size:0.82rem;color:#9A7B5C">${item.total_qty} sold</span>
                  </div>`).join('');
            }

            // Recent orders
            const tbody = document.getElementById('recentOrdersBody');
            if (tbody && d.recent?.length) {
                tbody.innerHTML = d.recent.map(o => `
                  <tr>
                    <td><strong>${o.order_code}</strong></td>
                    <td>${o.customer_name}</td>
                    <td>—</td>
                    <td><strong>₹${parseFloat(o.total_amount).toFixed(0)}</strong></td>
                    <td><span class="badge badge-${o.order_status}">${o.order_status}</span></td>
                    <td>${new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>`).join('');
            }
        } catch (err) {
            toast('Dashboard load failed: ' + err.message, 'error');
        }
    };

    // ── USERS ────────────────────────────────────────────────────
    window.loadUsers = async function() {
        try {
            const users = await adminApiReq('admin', 'users');
            const tbody = document.getElementById('usersBody');
            tbody.innerHTML = users.map((u, i) => `
              <tr>
                <td>${i+1}</td>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>${u.phone || '—'}</td>
                <td>${new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                <td><span class="badge badge-${u.status}">${u.status}</span></td>
                <td>
                  <button class="btn btn-sm ${u.status==='active'?'btn-danger':'btn-success'}"
                    onclick="toggleBan(${u.id},'${u.status==='active'?'banned':'active'}')">
                    ${u.status === 'active' ? 'Ban' : 'Unban'}
                  </button>
                </td>
              </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:30px;color:#9A7B5C">No users</td></tr>';
            document.getElementById('userCount').textContent = users.length + ' users';
        } catch (err) { toast('Load failed: ' + err.message, 'error'); }
    };

    window.toggleBan = async function(id, status) {
        try {
            await adminApiReq('admin', `ban_user&id=${id}`, 'POST', { status });
            toast(`User ${status === 'banned' ? 'banned' : 'unbanned'}`, 'success');
            loadUsers();
        } catch (err) { toast(err.message, 'error'); }
    };

    // ── FOODS ────────────────────────────────────────────────────
    window.loadFoods = async function() {
        try {
            const foods = await adminApiReq('foods', 'list');
            const tbody = document.getElementById('foodsBody');
            tbody.innerHTML = foods.map(f => `
              <tr>
                <td>${f.emoji || '🍛'} ${f.name}</td>
                <td>${f.category_name || f.category_slug}</td>
                <td>₹${parseFloat(f.price).toFixed(0)}</td>
                <td><span class="badge" style="background:${f.type==='veg'?'#D4EDDA':'#F8D7DA'};color:${f.type==='veg'?'#155724':'#721C24'}">${f.type}</span></td>
                <td><span class="badge badge-${f.status}">${f.status}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline" onclick="editFoodPHP(${f.id})">Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteFoodPHP(${f.id})" style="margin-left:4px">Delete</button>
                </td>
              </tr>`).join('');
        } catch (err) { toast('Load failed: ' + err.message, 'error'); }
    };

    window.deleteFoodPHP = async function(id) {
        if (!confirm('Delete this food item?')) return;
        try {
            await adminApiReq('foods', `delete&id=${id}`, 'POST');
            toast('Food deleted', 'success');
            loadFoods();
        } catch (err) { toast(err.message, 'error'); }
    };

    // Save food – override
    window.saveFoodItem = async function(e) {
        e.preventDefault();
        const payload = {
            name: document.getElementById('fName').value,
            category_id: { morning:1, afternoon:2, evening:3, night:4 }[document.getElementById('fCategory').value] || 1,
            price: document.getElementById('fPrice').value,
            type: document.getElementById('fType').value,
            emoji: document.getElementById('fEmoji').value || '🍛',
            description: document.getElementById('fDesc').value,
            status: document.getElementById('fStatus').value,
        };
        try {
            if (editingFoodId) {
                await adminApiReq('foods', `update&id=${editingFoodId}`, 'POST', payload);
                toast('Food updated!', 'success');
            } else {
                await adminApiReq('foods', 'create', 'POST', payload);
                toast('Food added!', 'success');
            }
            document.getElementById('foodModal').classList.remove('open');
            loadFoods();
        } catch (err) { toast(err.message, 'error'); }
    };

    // ── ORDERS ───────────────────────────────────────────────────
    window.loadOrders = async function() {
        try {
            const result = await adminApiReq('orders', 'all');
            const orders = result.orders || [];
            const tbody  = document.getElementById('ordersBody');
            tbody.innerHTML = orders.map(o => `
              <tr>
                <td><strong>${o.order_code}</strong></td>
                <td>${o.customer_name}</td>
                <td style="max-width:200px;font-size:0.8rem">${o.items_summary || '—'}</td>
                <td><strong>₹${parseFloat(o.total_amount).toFixed(0)}</strong></td>
                <td style="text-transform:capitalize">${o.payment_method === 'cod' ? 'Cash' : o.payment_method?.toUpperCase()}</td>
                <td>
                  <select class="form-select" style="padding:5px;font-size:0.78rem;border-radius:6px"
                    onchange="updateOrderStatusPHP(${o.id}, this.value)">
                    ${['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'].map(s =>
                      `<option value="${s}" ${o.order_status===s?'selected':''}>${s.replace('_',' ')}</option>`
                    ).join('')}
                  </select>
                </td>
                <td>${new Date(o.created_at).toLocaleDateString('en-IN')}</td>
              </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:30px;color:#9A7B5C">No orders</td></tr>';
            document.getElementById('orderCount').textContent = (result.total || orders.length) + ' orders';
        } catch (err) { toast('Load failed: ' + err.message, 'error'); }
    };

    window.updateOrderStatusPHP = async function(id, status) {
        try {
            await adminApiReq('orders', `status&id=${id}`, 'POST', { status });
            toast(`Order marked as ${status}`, 'success');
        } catch (err) { toast(err.message, 'error'); }
    };

    // ── PAYMENTS ─────────────────────────────────────────────────
    window.loadPayments = async function() {
        try {
            const data = await adminApiReq('admin', 'payments');
            const tbody = document.getElementById('paymentsBody');
            tbody.innerHTML = (data.daily || []).map(p => `
              <tr>
                <td>—</td><td>—</td><td>—</td>
                <td style="text-transform:capitalize">${p.payment_method}</td>
                <td><strong>₹${parseFloat(p.revenue).toFixed(0)}</strong></td>
                <td><span class="badge badge-confirmed">Collected</span></td>
                <td>${new Date(p.day).toLocaleDateString('en-IN')}</td>
              </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:30px;color:#9A7B5C">No payments</td></tr>';

            const breakdown = {};
            (data.breakdown || []).forEach(b => {
                if (!breakdown[b.payment_method]) breakdown[b.payment_method] = 0;
                breakdown[b.payment_method] += parseFloat(b.revenue);
            });
            const icons = { cod:'💵', phonepe:'📱', gpay:'🔵', paytm:'💙' };
            document.getElementById('payBreakdown').innerHTML = Object.entries(breakdown).map(([m, rev]) => `
              <div style="background:#FFF8F0;border-radius:10px;padding:16px;text-align:center;margin-bottom:10px">
                <div style="font-size:1.5rem">${icons[m] || '💳'}</div>
                <div style="font-size:0.75rem;color:#9A7B5C;margin:4px 0;text-transform:capitalize">${m}</div>
                <div style="font-weight:700;color:#FF6B1A">₹${parseFloat(rev).toLocaleString()}</div>
              </div>`).join('') || '<p style="color:#9A7B5C">No data yet</p>';
        } catch (err) { toast('Load failed: ' + err.message, 'error'); }
    };

    // ── REVIEWS ──────────────────────────────────────────────────
    window.loadReviews = async function() {
        try {
            const reviews = await adminApiReq('reviews', 'all');
            const tbody   = document.getElementById('reviewsBody');
            tbody.innerHTML = reviews.map((r, i) => `
              <tr>
                <td>${i+1}</td>
                <td><strong>${r.user_name}</strong></td>
                <td>${r.food_emoji} ${r.food_name}</td>
                <td>${'⭐'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</td>
                <td style="max-width:200px;font-size:0.82rem">${r.review_text?.substring(0,80)}${r.review_text?.length>80?'...':''}</td>
                <td>${new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                <td>
                  <button class="btn btn-sm btn-danger" onclick="deleteReviewPHP(${r.id})">Delete</button>
                </td>
              </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:30px;color:#9A7B5C">No reviews</td></tr>';
            document.getElementById('reviewCount').textContent = reviews.length + ' reviews';

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
        } catch (err) { toast('Load failed: ' + err.message, 'error'); }
    };

    window.deleteReviewPHP = async function(id) {
        if (!confirm('Delete this review?')) return;
        try {
            await adminApiReq('reviews', `delete&id=${id}`, 'POST');
            toast('Review deleted', 'success');
            loadReviews();
        } catch (err) { toast(err.message, 'error'); }
    };

    console.log('✅ PHP Admin connector loaded. API base:', ADMIN_API);
} else {
    console.log('ℹ️ Admin running in localStorage mode. Set USE_PHP_ADMIN=true to connect to PHP backend.');
}
