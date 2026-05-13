# 🍛 Annapoorna – South Indian Food Management System

A full-stack food ordering and management system built with **HTML, CSS, JavaScript** (frontend) and **PHP + MySQL** (backend). Features authentic South Indian cuisine with user-facing ordering and a complete admin panel.

---

## 📁 Project Structure

```
south-indian-fms/
├── index.html              ← Main frontend (customer site)
├── css/
│   ├── style.css           ← Frontend styles (saffron/turmeric theme)
│   └── admin.css           ← Admin panel styles
├── js/
│   ├── app.js              ← Frontend logic (localStorage mode)
│   ├── api.js              ← PHP backend connector (customer)
│   └── admin-api.js        ← PHP backend connector (admin)
├── admin/
│   └── index.html          ← Admin panel
└── backend/
    ├── index.php           ← API router
    ├── database.sql        ← MySQL schema + seed data
    ├── config/
    │   ├── database.php    ← PDO connection + DB class
    │   └── helpers.php     ← JWT auth, validators, response helpers
    └── api/
        ├── auth.php        ← Register / Login / Me
        ├── foods.php       ← Menu items CRUD
        ← orders.php       ← Place / track / manage orders
        ├── reviews.php     ← Customer reviews CRUD
        └── admin.php       ← Dashboard stats, reports
```

---

## 🚀 PHASE 1 – Frontend Only (Works Immediately)

Open `index.html` directly in a browser. No server needed.

**Features available:**
- ✅ User registration & login (stored in localStorage)
- ✅ Browse 4 category menus (32+ South Indian dishes)
- ✅ Add to cart, adjust quantities, remove items
- ✅ Cart with subtotal + GST + delivery fee
- ✅ Payment selection (Cash, PhonePe, GPay, Paytm)
- ✅ Order placement and order history
- ✅ Customer reviews (submit & view)
- ✅ User profile with stats
- ✅ Admin panel with full management (localStorage-based)

**Admin Login:** Username: `admin` | Password: `admin123`

---

## ⚙️ PHASE 2 – Full PHP + MySQL Backend

### Step 1 – Requirements

| Requirement | Version |
|-------------|---------|
| PHP         | 8.0+    |
| MySQL       | 8.0+    |
| Apache/Nginx| Any     |
| PDO extension | Enabled |

Works with **XAMPP**, **WAMP**, **MAMP**, **Laragon**, or any LAMP/LEMP stack.

---

### Step 2 – Database Setup

```bash
# Open MySQL and run:
mysql -u root -p < backend/database.sql
```

Or import `backend/database.sql` via **phpMyAdmin**:
1. Open phpMyAdmin → New → Create DB `annapoorna_db`
2. Select DB → Import → Choose `database.sql` → Go

---

### Step 3 – Configure Database

Edit `backend/config/database.php`:

```php
define('DB_HOST',  'localhost');
define('DB_NAME',  'annapoorna_db');
define('DB_USER',  'root');       // ← your MySQL username
define('DB_PASS',  '');           // ← your MySQL password
```

---

### Step 4 – Place Files on Server

**XAMPP example:**
```
C:\xampp\htdocs\annapoorna\   ← put all files here
```

**Access URLs:**
- Frontend: `http://localhost/annapoorna/index.html`
- Admin:    `http://localhost/annapoorna/admin/`
- API:      `http://localhost/annapoorna/backend/?endpoint=foods&action=list`

---

### Step 5 – Enable PHP Backend

**In `js/api.js` (line 8):**
```javascript
const USE_PHP_BACKEND = true;  // ← Change false → true
const API_BASE = '../backend/index.php';  // ← Adjust path if needed
```

**In `js/admin-api.js` (line 8):**
```javascript
const USE_PHP_ADMIN = true;  // ← Change false → true
```

---

### Step 6 – Admin Login (PHP mode)

Default admin account seeded in `database.sql`:
- **Email:** `admin@annapoorna.com`
- **Password:** `Admin@123`

> Change the password after first login by updating the DB.

---

## 📡 REST API Reference

Base URL: `http://localhost/annapoorna/backend/index.php`

### Auth
| Method | URL | Body | Description |
|--------|-----|------|-------------|
| POST | `?endpoint=auth&action=register` | `{name, email, phone, password}` | Create account |
| POST | `?endpoint=auth&action=login` | `{email, password}` | Login → JWT |
| GET  | `?endpoint=auth&action=me` | — | Get own profile |

### Foods
| Method | URL | Description |
|--------|-----|-------------|
| GET  | `?endpoint=foods&action=list` | All active foods |
| GET  | `?endpoint=foods&action=list&category=morning` | Filter by category |
| GET  | `?endpoint=foods&action=categories` | List categories |
| GET  | `?endpoint=foods&action=detail&id=1` | Single food |
| POST | `?endpoint=foods&action=create` | Admin: add food |
| POST | `?endpoint=foods&action=update&id=1` | Admin: edit food |
| POST | `?endpoint=foods&action=delete&id=1` | Admin: remove food |

### Orders
| Method | URL | Description |
|--------|-----|-------------|
| POST | `?endpoint=orders&action=place` | Place order (auth required) |
| GET  | `?endpoint=orders&action=my_orders` | My orders |
| GET  | `?endpoint=orders&action=all` | Admin: all orders |
| POST | `?endpoint=orders&action=status&id=1` | Admin: update status |
| POST | `?endpoint=orders&action=cancel&id=1` | Cancel own order |

### Reviews
| Method | URL | Description |
|--------|-----|-------------|
| GET  | `?endpoint=reviews&action=list` | Public reviews |
| POST | `?endpoint=reviews&action=create` | Submit review (auth) |
| GET  | `?endpoint=reviews&action=all` | Admin: all reviews |
| POST | `?endpoint=reviews&action=delete&id=1` | Admin: delete |

### Admin
| Method | URL | Description |
|--------|-----|-------------|
| GET  | `?endpoint=admin&action=dashboard` | Stats + charts |
| GET  | `?endpoint=admin&action=users` | All users |
| POST | `?endpoint=admin&action=ban_user&id=1` | Ban/unban user |
| GET  | `?endpoint=admin&action=payments` | Payment breakdown |
| GET  | `?endpoint=admin&action=reports` | Revenue reports |

**Authentication:** Pass JWT as `Authorization: Bearer <token>` header.

---

## 🎨 Features Highlights

### Customer Site
- 🌅 **Morning Menu** – Idli, Dosa, Vadai, Coffee, Tea, Upma, Pongal, Poori
- ☀️ **Afternoon Menu** – Biriyani (Veg/Chicken/Mutton), Rice Meals, Parotta
- 🌇 **Evening Menu** – Bajji, Chicken 65, Manchurian, Noodles, Fried Rice
- 🌙 **Night Menu** – Fried Rice, Paneer Masala, Ice Cream, Gulab Jamun, Lassi
- 🛒 Live cart with quantity controls
- 💳 Payment: Cash on Delivery, PhonePe, Google Pay, Paytm
- ⭐ Reviews with star rating
- 👤 User profile with order history & spend stats

### Admin Panel
- 📊 Dashboard with revenue chart, top items, recent orders
- 👥 User management (list, ban/unban)
- 🍛 Food management (add, edit, delete, toggle status)
- 📋 Order management with status updates (Confirmed → Preparing → Delivered)
- 💳 Payment records & method breakdown
- ⭐ Review moderation (view, delete)

---

## 🛠 Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page | Check browser console for JS errors |
| API 500 error | Check `DB_HOST/DB_USER/DB_PASS` in `config/database.php` |
| CORS errors | Ensure files are served by Apache/Nginx, not opened as `file://` |
| Login fails (PHP) | Verify `annapoorna_db` exists and admin user was seeded |
| Cart not saving | localStorage must be enabled in browser |

---

## 📝 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Fonts | Playfair Display, Poppins (Google Fonts) |
| Backend | PHP 8.0+ |
| Database | MySQL 8.0+ |
| Auth | JWT (HMAC-SHA256) |
| ORM | PDO (prepared statements) |
| Passwords | bcrypt (cost 12) |

---

*Made with ❤️ for authentic South Indian cuisine — Annapoorna Kitchen, Chennai*
