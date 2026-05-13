<?php
// ══════════════════════════════════════════════════════════════
//  ANNAPOORNA – ORDERS API
//  File: backend/api/orders.php
//  Routes:
//    POST place      – authenticated user places order
//    GET  my_orders  – logged-in user's orders
//    GET  detail     – ?id=N order detail with items
//    GET  all        – admin: all orders
//    POST status     – admin: update order status  ?id=N
//    POST cancel     – authenticated user cancels own order ?id=N
// ══════════════════════════════════════════════════════════════

require_once __DIR__ . '/../config/helpers.php';
setCorsHeaders();

$action = $_GET['action'] ?? '';
match ($action) {
    'place'      => placeOrder(),
    'my_orders'  => myOrders(),
    'detail'     => orderDetail(),
    'all'        => allOrders(),
    'status'     => updateStatus(),
    'cancel'     => cancelOrder(),
    default      => error("Unknown action: $action", 404),
};

// ── PLACE ORDER ───────────────────────────────────────────────
function placeOrder(): void {
    $auth = requireAuth();
    $body = getBody();

    $errs = validate($body, [
        'items'          => 'required',
        'payment_method' => 'required|in:cod,phonepe,gpay,paytm',
    ]);
    if ($errs) error('Validation failed', 422, $errs);

    $items = $body['items'] ?? [];
    if (!is_array($items) || empty($items)) error('Order must have at least one item');

    $pdo = db();

    // Validate & price each item from DB
    $orderItems  = [];
    $subtotal    = 0.0;
    foreach ($items as $item) {
        $id  = (int)($item['id']  ?? 0);
        $qty = (int)($item['qty'] ?? 1);
        if ($id < 1 || $qty < 1) continue;

        $stmt = $pdo->prepare('SELECT * FROM foods WHERE id = ? AND status = "active"');
        $stmt->execute([$id]);
        $food = $stmt->fetch();
        if (!$food) error("Food item #$id not found or unavailable");

        $lineTotal    = $food['price'] * $qty;
        $subtotal    += $lineTotal;
        $orderItems[] = [
            'food_id'     => $food['id'],
            'food_name'   => $food['name'],
            'food_emoji'  => $food['emoji'],
            'quantity'    => $qty,
            'unit_price'  => $food['price'],
            'total_price' => $lineTotal,
        ];
    }
    if (empty($orderItems)) error('No valid items in order');

    $delivery = 30.00;
    $gst      = round($subtotal * 0.05, 2);
    $total    = $subtotal + $delivery + $gst;
    $code     = generateOrderCode();

    // Insert order
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO orders
             (order_code, user_id, subtotal, delivery_fee, gst_amount, total_amount,
              payment_method, payment_status, order_status, delivery_address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, "confirmed", ?)'
        );
        $payStatus = ($body['payment_method'] === 'cod') ? 'pending' : 'paid';
        $stmt->execute([
            $code,
            $auth['sub'],
            $subtotal,
            $delivery,
            $gst,
            $total,
            $body['payment_method'],
            $payStatus,
            $body['address'] ?? null,
        ]);
        $orderId = (int)$pdo->lastInsertId();

        // Insert items
        $ins = $pdo->prepare(
            'INSERT INTO order_items
             (order_id, food_id, food_name, food_emoji, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        foreach ($orderItems as $oi) {
            $ins->execute([
                $orderId,
                $oi['food_id'],
                $oi['food_name'],
                $oi['food_emoji'],
                $oi['quantity'],
                $oi['unit_price'],
                $oi['total_price'],
            ]);
        }
        $pdo->commit();
        success([
            'order_id'   => $orderId,
            'order_code' => $code,
            'total'      => $total,
        ], "Order $code placed successfully!");
    } catch (Exception $e) {
        $pdo->rollBack();
        error('Failed to place order: ' . $e->getMessage(), 500);
    }
}

// ── MY ORDERS ─────────────────────────────────────────────────
function myOrders(): void {
    $auth  = requireAuth();
    $pdo   = db();
    $stmt  = $pdo->prepare(
        'SELECT o.*,
                GROUP_CONCAT(CONCAT(oi.food_emoji," ",oi.food_name,"×",oi.quantity) SEPARATOR ", ") AS items_summary
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC'
    );
    $stmt->execute([$auth['sub']]);
    success($stmt->fetchAll());
}

// ── ORDER DETAIL ──────────────────────────────────────────────
function orderDetail(): void {
    $auth = requireAuth();
    $id   = (int)($_GET['id'] ?? 0);
    if (!$id) error('Order ID required');

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    if (!$order) error('Order not found', 404);

    // Only owner or admin can view
    if ($order['user_id'] !== $auth['sub'] && $auth['role'] !== 'admin') {
        error('Forbidden', 403);
    }

    $iStmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
    $iStmt->execute([$id]);
    $order['items'] = $iStmt->fetchAll();
    success($order);
}

// ── ALL ORDERS (admin) ────────────────────────────────────────
function allOrders(): void {
    requireAdmin();
    $pdo  = db();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $per  = min(100, max(10, (int)($_GET['per'] ?? 20)));
    $off  = ($page - 1) * $per;

    $status = $_GET['status'] ?? null;
    $sql    = 'SELECT o.*, u.name AS customer_name, u.email AS customer_email,
                      GROUP_CONCAT(CONCAT(oi.food_emoji," ",oi.food_name,"×",oi.quantity) SEPARATOR ", ") AS items_summary
               FROM orders o
               JOIN users u ON u.id = o.user_id
               LEFT JOIN order_items oi ON oi.order_id = o.id';
    $params = [];
    if ($status) { $sql .= ' WHERE o.order_status = ?'; $params[] = $status; }
    $sql .= ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    $params[] = $per; $params[] = $off;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    $countStmt = $pdo->prepare('SELECT COUNT(*) FROM orders' . ($status ? ' WHERE order_status=?' : ''));
    $countStmt->execute($status ? [$status] : []);
    $total = (int)$countStmt->fetchColumn();

    success(['orders' => $orders, 'total' => $total, 'page' => $page, 'per' => $per]);
}

// ── UPDATE STATUS (admin) ─────────────────────────────────────
function updateStatus(): void {
    requireAdmin();
    $id     = (int)($_GET['id'] ?? 0);
    $body   = getBody();
    $status = $body['status'] ?? '';
    $allowed = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
    if (!$id || !in_array($status, $allowed)) error('Invalid order ID or status');

    $payStatus = null;
    if ($status === 'delivered')  $payStatus = 'paid';
    if ($status === 'cancelled')  $payStatus = 'refunded';

    $pdo  = db();
    $sql  = 'UPDATE orders SET order_status = ?' . ($payStatus ? ', payment_status = ?' : '') . ' WHERE id = ?';
    $prms = $payStatus ? [$status, $payStatus, $id] : [$status, $id];
    $stmt = $pdo->prepare($sql);
    $stmt->execute($prms);
    if ($stmt->rowCount() === 0) error('Order not found', 404);
    success(null, 'Order status updated to ' . $status);
}

// ── CANCEL ORDER (user) ───────────────────────────────────────
function cancelOrder(): void {
    $auth = requireAuth();
    $id   = (int)($_GET['id'] ?? 0);
    if (!$id) error('Order ID required');

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $auth['sub']]);
    $order = $stmt->fetch();
    if (!$order) error('Order not found', 404);

    if (in_array($order['order_status'], ['delivered','cancelled'])) {
        error('Cannot cancel this order');
    }
    $pdo->prepare("UPDATE orders SET order_status='cancelled', payment_status='refunded' WHERE id=?")
        ->execute([$id]);
    success(null, 'Order cancelled successfully');
}
