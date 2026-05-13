<?php
// ══════════════════════════════════════════════════════════════
//  M.S. Pandi – ADMIN API
//  File: backend/api/admin.php
//  Routes:
//    GET  dashboard – summary stats
//    GET  users     – list all users
//    POST ban_user  – ban / unban a user ?id=N
//    GET  payments  – payment breakdown
//    GET  reports   – revenue by day (last 30 days)
// ══════════════════════════════════════════════════════════════

require_once __DIR__ . '/../config/helpers.php';
setCorsHeaders();

$action = $_GET['action'] ?? 'dashboard';
match ($action) {
    'dashboard' => dashboard(),
    'users'     => listUsers(),
    'ban_user'  => banUser(),
    'payments'  => payments(),
    'reports'   => reports(),
    default     => error("Unknown action: $action", 404),
};

// ── DASHBOARD ─────────────────────────────────────────────────
function dashboard(): void {
    requireAdmin();
    $pdo = db();

    // Counts
    $counts = [];
    foreach ([
        'total_users'   => 'SELECT COUNT(*) FROM users WHERE role="user"',
        'total_orders'  => 'SELECT COUNT(*) FROM orders',
        'total_revenue' => 'SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE order_status NOT IN ("cancelled")',
        'total_foods'   => 'SELECT COUNT(*) FROM foods WHERE status="active"',
        'pending_orders'=> 'SELECT COUNT(*) FROM orders WHERE order_status IN ("pending","confirmed","preparing")',
        'total_reviews' => 'SELECT COUNT(*) FROM reviews',
        'avg_rating'    => 'SELECT COALESCE(AVG(rating),0) FROM reviews WHERE status="approved"',
    ] as $key => $sql) {
        $counts[$key] = $pdo->query($sql)->fetchColumn();
    }

    // Revenue last 7 days
    $rev7 = $pdo->query(
        'SELECT DATE(created_at) AS day, SUM(total_amount) AS revenue
         FROM orders
         WHERE order_status != "cancelled"
           AND created_at >= CURDATE() - INTERVAL 7 DAY
         GROUP BY DATE(created_at) ORDER BY day'
    )->fetchAll();

    // Top 5 foods by orders
    $top5 = $pdo->query(
        'SELECT f.name, f.emoji, SUM(oi.quantity) AS total_qty
         FROM order_items oi JOIN foods f ON f.id = oi.food_id
         GROUP BY oi.food_id ORDER BY total_qty DESC LIMIT 5'
    )->fetchAll();

    // Recent 5 orders
    $recent = $pdo->query(
        'SELECT o.order_code, o.total_amount, o.order_status, o.payment_method, o.created_at,
                u.name AS customer_name
         FROM orders o JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC LIMIT 5'
    )->fetchAll();

    success([
        'counts'  => $counts,
        'rev7'    => $rev7,
        'top5'    => $top5,
        'recent'  => $recent,
    ]);
}

// ── LIST USERS ────────────────────────────────────────────────
function listUsers(): void {
    requireAdmin();
    $pdo  = db();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $per  = min(100, (int)($_GET['per'] ?? 20));
    $off  = ($page - 1) * $per;

    $q      = $_GET['q'] ?? null;
    $sql    = 'SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
                      COUNT(o.id) AS order_count,
                      COALESCE(SUM(o.total_amount),0) AS total_spent
               FROM users u
               LEFT JOIN orders o ON o.user_id = u.id';
    $params = [];
    if ($q) {
        $sql    .= ' WHERE (u.name LIKE ? OR u.email LIKE ?)';
        $params  = ["%$q%", "%$q%"];
    }
    $sql   .= ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    $params[] = $per; $params[] = $off;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    success($stmt->fetchAll());
}

// ── BAN / UNBAN USER ─────────────────────────────────────────
function banUser(): void {
    requireAdmin();
    $id     = (int)($_GET['id'] ?? 0);
    $body   = getBody();
    $status = $body['status'] ?? 'banned';
    if (!in_array($status, ['active','banned'])) error('Invalid status');
    $stmt = db()->prepare('UPDATE users SET status=? WHERE id=? AND role="user"');
    $stmt->execute([$status, $id]);
    success(null, 'User status updated to ' . $status);
}

// ── PAYMENT BREAKDOWN ─────────────────────────────────────────
function payments(): void {
    requireAdmin();
    $pdo = db();

    $breakdown = $pdo->query(
        'SELECT payment_method,
                COUNT(*) AS count,
                SUM(total_amount) AS revenue,
                payment_status
         FROM orders
         GROUP BY payment_method, payment_status
         ORDER BY payment_method'
    )->fetchAll();

    $daily = $pdo->query(
        'SELECT DATE(created_at) AS day,
                payment_method,
                COUNT(*) AS count,
                SUM(total_amount) AS revenue
         FROM orders
         WHERE created_at >= CURDATE() - INTERVAL 30 DAY
         GROUP BY DATE(created_at), payment_method
         ORDER BY day DESC'
    )->fetchAll();

    success(['breakdown' => $breakdown, 'daily' => $daily]);
}

// ── REVENUE REPORTS ───────────────────────────────────────────
function reports(): void {
    requireAdmin();
    $pdo  = db();
    $days = max(7, min(90, (int)($_GET['days'] ?? 30)));

    $daily = $pdo->prepare(
        'SELECT DATE(created_at) AS day,
                COUNT(*) AS orders,
                SUM(total_amount) AS revenue
         FROM orders
         WHERE order_status != "cancelled"
           AND created_at >= CURDATE() - INTERVAL ? DAY
         GROUP BY DATE(created_at) ORDER BY day'
    );
    $daily->execute([$days]);

    $catRevenue = $pdo->query(
        'SELECT c.name AS category, SUM(oi.total_price) AS revenue
         FROM order_items oi
         JOIN foods f ON f.id = oi.food_id
         JOIN categories c ON c.id = f.category_id
         GROUP BY f.category_id ORDER BY revenue DESC'
    )->fetchAll();

    success(['daily' => $daily->fetchAll(), 'by_category' => $catRevenue]);
}
