<?php
// ══════════════════════════════════════════════════════════════
//  M.S. Pandi – REVIEWS API
//  File: backend/api/reviews.php
//  Routes:
//    GET  list    – public list (optionally ?food_id=N)
//    POST create  – authenticated user submits review
//    POST delete  – admin removes review ?id=N
//    POST approve – admin approves review ?id=N
//    GET  all     – admin: all reviews incl. pending
// ══════════════════════════════════════════════════════════════

require_once __DIR__ . '/../config/helpers.php';
setCorsHeaders();

$action = $_GET['action'] ?? 'list';
match ($action) {
    'list'    => listReviews(),
    'create'  => createReview(),
    'delete'  => deleteReview(),
    'approve' => approveReview(),
    'all'     => allReviews(),
    default   => error("Unknown action: $action", 404),
};

// ── LIST REVIEWS (public) ─────────────────────────────────────
function listReviews(): void {
    $pdo    = db();
    $foodId = isset($_GET['food_id']) ? (int)$_GET['food_id'] : null;
    $limit  = min(50, max(5, (int)($_GET['limit'] ?? 12)));

    $sql  = 'SELECT r.id, r.rating, r.review_text, r.created_at,
                    u.name AS user_name,
                    f.name AS food_name, f.emoji AS food_emoji
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             JOIN foods  f ON f.id = r.food_id
             WHERE r.status = "approved"';
    $params = [];
    if ($foodId) { $sql .= ' AND r.food_id = ?'; $params[] = $foodId; }
    $sql .= ' ORDER BY r.created_at DESC LIMIT ?';
    $params[] = $limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    success($stmt->fetchAll());
}

// ── CREATE REVIEW ─────────────────────────────────────────────
function createReview(): void {
    $auth = requireAuth();
    $body = getBody();
    $errs = validate($body, [
        'food_id'     => 'required|numeric',
        'rating'      => 'required|numeric',
        'review_text' => 'required|min:10|max:1000',
    ]);
    if ($errs) error('Validation failed', 422, $errs);

    $rating = (int)$body['rating'];
    if ($rating < 1 || $rating > 5) error('Rating must be between 1 and 5');

    $pdo    = db();
    $foodId = (int)$body['food_id'];

    // Check food exists
    $fStmt = $pdo->prepare('SELECT id FROM foods WHERE id = ? AND status="active"');
    $fStmt->execute([$foodId]);
    if (!$fStmt->fetch()) error('Food item not found', 404);

    // One review per user per food
    $dup = $pdo->prepare('SELECT id FROM reviews WHERE user_id=? AND food_id=?');
    $dup->execute([$auth['sub'], $foodId]);
    if ($dup->fetch()) error('You have already reviewed this item. Thank you!', 409);

    $stmt = $pdo->prepare(
        'INSERT INTO reviews (user_id, food_id, rating, review_text, status) VALUES (?,?,?,?,"approved")'
    );
    $stmt->execute([$auth['sub'], $foodId, $rating, trim($body['review_text'])]);
    success(['id' => (int)$pdo->lastInsertId()], 'Review submitted – thank you!');
}

// ── DELETE REVIEW (admin) ─────────────────────────────────────
function deleteReview(): void {
    requireAdmin();
    $id   = (int)($_GET['id'] ?? 0);
    if (!$id) error('Review ID required');
    $stmt = db()->prepare('DELETE FROM reviews WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) error('Review not found', 404);
    success(null, 'Review deleted');
}

// ── APPROVE REVIEW (admin) ────────────────────────────────────
function approveReview(): void {
    requireAdmin();
    $id     = (int)($_GET['id'] ?? 0);
    $body   = getBody();
    $status = $body['status'] ?? 'approved';
    if (!in_array($status, ['approved','rejected','pending'])) error('Invalid status');
    $stmt = db()->prepare('UPDATE reviews SET status = ? WHERE id = ?');
    $stmt->execute([$status, $id]);
    success(null, 'Review status updated');
}

// ── ALL REVIEWS (admin) ───────────────────────────────────────
function allReviews(): void {
    requireAdmin();
    $pdo  = db();
    $status = $_GET['status'] ?? null;
    $sql  = 'SELECT r.*, u.name AS user_name, f.name AS food_name, f.emoji AS food_emoji
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             JOIN foods  f ON f.id = r.food_id';
    $params = [];
    if ($status) { $sql .= ' WHERE r.status = ?'; $params[] = $status; }
    $sql .= ' ORDER BY r.created_at DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    success($stmt->fetchAll());
}
