-- ══════════════════════════════════════════════════════════════
--  ANNAPOORNA – SOUTH INDIAN FOOD MANAGEMENT SYSTEM
--  MySQL Database Schema
--  Version: 1.0.0
-- ══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS annapoorna_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE annapoorna_db;

-- ── TABLE: users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)        NOT NULL,
  email       VARCHAR(180)        NOT NULL UNIQUE,
  phone       VARCHAR(20)         DEFAULT NULL,
  password    VARCHAR(255)        NOT NULL,
  role        ENUM('user','admin') DEFAULT 'user',
  status      ENUM('active','banned') DEFAULT 'active',
  created_at  DATETIME            DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── TABLE: categories ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(50)  NOT NULL UNIQUE,
  name        VARCHAR(80)  NOT NULL,
  emoji       VARCHAR(10)  DEFAULT '🍛',
  time_range  VARCHAR(80)  DEFAULT NULL,
  sort_order  INT          DEFAULT 0,
  status      ENUM('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB;

INSERT INTO categories (slug, name, emoji, time_range, sort_order) VALUES
  ('morning',   'Morning',   '🌅', '6:00 AM – 11:00 AM', 1),
  ('afternoon', 'Afternoon', '☀️',  '11:00 AM – 4:00 PM',  2),
  ('evening',   'Evening',   '🌇', '4:00 PM – 8:00 PM',   3),
  ('night',     'Night',     '🌙', '8:00 PM – 11:00 PM',  4);

-- ── TABLE: foods ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS foods (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  category_id  INT          NOT NULL,
  name         VARCHAR(120) NOT NULL,
  emoji        VARCHAR(10)  DEFAULT '🍛',
  description  TEXT         DEFAULT NULL,
  price        DECIMAL(8,2) NOT NULL,
  type         ENUM('veg','non-veg') DEFAULT 'veg',
  status       ENUM('active','inactive') DEFAULT 'active',
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO foods (category_id, name, emoji, description, price, type) VALUES
  -- Morning (cat 1)
  (1, 'Idli',          '🫓', 'Soft steamed rice cakes served with sambar & coconut chutney',              40.00, 'veg'),
  (1, 'Masala Dosa',   '🫓', 'Crispy rice crepe stuffed with spiced potato filling',                      70.00, 'veg'),
  (1, 'Medu Vadai',    '🍩', 'Crispy urad dal fritters with chutney & sambar',                            45.00, 'veg'),
  (1, 'Filter Coffee', '☕', 'Authentic South Indian decoction coffee with frothy milk',                  30.00, 'veg'),
  (1, 'Masala Tea',    '🍵', 'Spiced ginger cardamom chai with full-fat milk',                            25.00, 'veg'),
  (1, 'Rava Upma',     '🍚', 'Semolina porridge with vegetables, mustard & curry leaves',                 55.00, 'veg'),
  (1, 'Pongal',        '🍛', 'Creamy rice-lentil porridge with pepper & ghee',                            60.00, 'veg'),
  (1, 'Poori & Curry', '🫓', 'Deep-fried puffed bread with spiced potato kurma',                          65.00, 'veg'),
  -- Afternoon (cat 2)
  (2, 'Vegetable Biriyani',  '🍛', 'Fragrant basmati rice with seasonal vegetables & whole spices',      140.00, 'veg'),
  (2, 'Chicken Biriyani',    '🍛', 'Aromatic Chettinad chicken dum biriyani with raita',                  180.00, 'non-veg'),
  (2, 'Mutton Biriyani',     '🍛', 'Slow-cooked tender mutton with saffron basmati',                      220.00, 'non-veg'),
  (2, 'Plain Rice Meals',    '🍽️', 'Full South Indian meal with sambar, rasam & 3 gravies',               90.00, 'veg'),
  (2, 'Chicken Curry Rice',  '🍗', 'Country chicken curry with steamed rice & papad',                     150.00, 'non-veg'),
  (2, 'Fish Curry Rice',     '🐟', 'Spicy fish curry in tamarind gravy with boiled rice',                 160.00, 'non-veg'),
  (2, 'Parotta & Salna',     '🫓', 'Flaky layered flatbread with tomato-onion salna',                      80.00, 'veg'),
  (2, 'Egg Rice',            '🍳', 'Flavored egg fried rice with sautéed vegetables',                     110.00, 'non-veg'),
  -- Evening (cat 3)
  (3, 'Bajji Varieties',   '🍢', 'Assorted deep-fried fritters with coconut & mint chutney',              60.00, 'veg'),
  (3, 'Chicken 65',        '🍗', 'Spicy crispy fried chicken cubes with curry leaves',                    160.00, 'non-veg'),
  (3, 'Gobi Manchurian',   '🥦', 'Crispy cauliflower in Indo-Chinese tangy sauce',                        130.00, 'veg'),
  (3, 'Fried Noodles',     '🍜', 'Wok-tossed noodles with vegetables & soy sauce',                        120.00, 'veg'),
  (3, 'Chicken Noodles',   '🍜', 'Spicy chicken hakka noodles with spring onions',                        150.00, 'non-veg'),
  (3, 'Veg Fried Rice',    '🍚', 'Stir-fried basmati rice with colorful vegetables',                      110.00, 'veg'),
  (3, 'Bread Omelette',    '🍳', 'Spiced egg omelette with toast & butter',                                65.00, 'non-veg'),
  (3, 'Samosa (3 pcs)',    '🫙', 'Golden fried pastry pockets with spiced potato filling',                 45.00, 'veg'),
  -- Night (cat 4)
  (4, 'Chicken Fried Rice',     '🍚', 'Aromatic fried rice with tender chicken pieces',                   160.00, 'non-veg'),
  (4, 'Panneer Butter Masala',  '🧀', 'Rich creamy tomato gravy with fresh cottage cheese',               170.00, 'veg'),
  (4, 'Egg Biriyani',           '🍛', 'Fragrant biriyani with boiled eggs & caramelized onions',          140.00, 'non-veg'),
  (4, 'Ice Cream (2 scoops)',   '🍦', 'Choice of vanilla, mango, or strawberry with wafer',               80.00, 'veg'),
  (4, 'Gulab Jamun',            '🟤', 'Soft milk-solid dumplings in warm rose syrup',                      55.00, 'veg'),
  (4, 'Kesari',                 '🟡', 'Saffron semolina halwa with cashews & raisins',                     50.00, 'veg'),
  (4, 'Lassi',                  '🥛', 'Thick creamy yogurt drink in sweet or mango flavor',                65.00, 'veg'),
  (4, 'Tender Coconut',         '🥥', 'Fresh young coconut water with malai',                              60.00, 'veg');

-- ── TABLE: orders ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  order_code     VARCHAR(30)  NOT NULL UNIQUE,
  user_id        INT          NOT NULL,
  subtotal       DECIMAL(10,2) NOT NULL,
  delivery_fee   DECIMAL(8,2)  DEFAULT 30.00,
  gst_amount     DECIMAL(8,2)  DEFAULT 0.00,
  total_amount   DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cod','phonepe','gpay','paytm') NOT NULL,
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  order_status   ENUM('pending','confirmed','preparing','out_for_delivery','delivered','cancelled') DEFAULT 'confirmed',
  delivery_address TEXT        DEFAULT NULL,
  notes          TEXT          DEFAULT NULL,
  created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ── TABLE: order_items ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT            NOT NULL,
  food_id    INT            NOT NULL,
  food_name  VARCHAR(120)   NOT NULL,
  food_emoji VARCHAR(10)    DEFAULT '🍛',
  quantity   INT            NOT NULL DEFAULT 1,
  unit_price DECIMAL(8,2)  NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id)  REFERENCES foods(id)  ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ── TABLE: reviews ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  food_id    INT          NOT NULL,
  rating     TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT        DEFAULT NULL,
  status     ENUM('approved','pending','rejected') DEFAULT 'approved',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Insert sample reviews (requires users to exist; run after first signup)
-- Sample admin user (password: Admin@123)
INSERT INTO users (name, email, phone, password, role) VALUES
  ('Admin Manager', 'admin@annapoorna.com', '9876543210',
   '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeewBbGkj9eQLGnCrwOa3Gvee', 'admin');
-- Note: The hash above = 'Admin@123' with bcrypt cost 12

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_foods_category     ON foods(category_id);
CREATE INDEX idx_foods_status       ON foods(status);
CREATE INDEX idx_orders_user        ON orders(user_id);
CREATE INDEX idx_orders_status      ON orders(order_status);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
CREATE INDEX idx_reviews_food       ON reviews(food_id);
CREATE INDEX idx_reviews_user       ON reviews(user_id);

-- ── VIEWS ────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_order_summary AS
SELECT
  o.id,
  o.order_code,
  u.name        AS customer_name,
  u.email       AS customer_email,
  u.phone       AS customer_phone,
  o.total_amount,
  o.payment_method,
  o.payment_status,
  o.order_status,
  o.created_at,
  COUNT(oi.id)  AS item_count
FROM orders o
JOIN users u  ON u.id = o.user_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;

CREATE OR REPLACE VIEW v_food_ratings AS
SELECT
  f.id,
  f.name,
  f.emoji,
  f.price,
  c.name        AS category,
  COUNT(r.id)   AS review_count,
  COALESCE(AVG(r.rating), 0) AS avg_rating
FROM foods f
JOIN categories c ON c.id = f.category_id
LEFT JOIN reviews r ON r.food_id = f.id AND r.status = 'approved'
GROUP BY f.id;
