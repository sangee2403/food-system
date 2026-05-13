<?php
// ══════════════════════════════════════════════════════════════
//  ANNAPOORNA – FOODS API
//  File: backend/api/foods.php
//  Routes:
//    GET  list           – all active foods (optionally ?category=morning)
//    GET  categories     – list all categories with food count
//    GET  detail         – ?id=N  single food with ratings
//    POST create         – admin only
//    POST update         – admin only  (?id=N)
//    POST delete         – admin only  (?id=N)
// ══════════════════════════════════════════════════════════════

require_once __DIR__ . '/../config/helpers.php';
setCorsHeaders();

$action = $_GET['action'] ?? 'list';
$method = $_SERVER['REQUEST_METHOD'];

match ($action) {
    'list'       => listFoods(),
    'categories' => listCategories(),
    'detail'     => foodDetail(),
    'create'     => createFood(),
    'update'     => updateFood(),
    'delete'     => deleteFood(),
    default      => error("Unknown action: $action", 404),
};

// ── LIST FOODS ────────────────────────────────────────────────
function listFoods(): void {
    $pdo  = db();
    $cat  = $_GET['category'] ?? null;
    $sql  = 'SELECT f.*, c.name AS category_name, c.slug AS category_slug,
                    COALESCE(AVG(r.rating),0) AS avg_rating,
                    COUNT(r.id) AS review_count
             FROM foods f
             JOIN categories c ON c.id = f.category_id
             LEFT JOIN reviews r ON r.food_id = f.id AND r.status = "approved"
             WHERE f.status = "active"';
    $params = [];
    if ($cat) { $sql .= ' AND c.slug = ?'; $params[] = $cat; }
    $sql .= ' GROUP BY f.id ORDER BY c.sort_order, f.id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    success($stmt->fetchAll());
}

// ── LIST CATEGORIES ───────────────────────────────────────────
function listCategories(): void {
    $stmt = db()->query(
        'SELECT c.*, COUNT(f.id) AS food_count
         FROM categories c
         LEFT JOIN foods f ON f.category_id = c.id AND f.status = "active"
         WHERE c.status = "active"
         GROUP BY c.id ORDER BY c.sort_order'
    );
    success($stmt->fetchAll());
}

// ── FOOD DETAIL ───────────────────────────────────────────────
function foodDetail(): void {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) error('Food ID required');
    $pdo  = db();
    $stmt = $pdo->prepare(
        'SELECT f.*, c.name AS category_name,
                COALESCE(AVG(r.rating),0) AS avg_rating,
                COUNT(r.id) AS review_count
         FROM foods f
         JOIN categories c ON c.id = f.category_id
         LEFT JOIN reviews r ON r.food_id = f.id AND r.status = "approved"
         WHERE f.id = ?
         GROUP BY f.id'
    );
    $stmt->execute([$id]);
    $food = $stmt->fetch();
    if (!$food) error('Food not found', 404);

    // Fetch reviews
    $rs = $pdo->prepare(
        'SELECT r.*, u.name AS user_name
         FROM reviews r JOIN users u ON u.id = r.user_id
         WHERE r.food_id = ? AND r.status = "approved"
         ORDER BY r.created_at DESC LIMIT 10'
    );
    $rs->execute([$id]);
    $food['reviews'] = $rs->fetchAll();
    success($food);
}

// ── CREATE FOOD (admin) ───────────────────────────────────────
function createFood(): void {
    requireAdmin();
    $body = getBody();
    $errs = validate($body, [
        'name'        => 'required|min:2|max:120',
        'category_id' => 'required|numeric',
        'price'       => 'required|numeric',
        'type'        => 'required|in:veg,non-veg',
    ]);
    if ($errs) error('Validation failed', 422, $errs);

    $stmt = db()->prepare(
        'INSERT INTO foods (category_id, name, emoji, description, price, type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        (int)$body['category_id'],
        trim($body['name']),
        trim($body['emoji'] ?? '🍛'),
        trim($body['description'] ?? ''),
        (float)$body['price'],
        $body['type'],
        $body['status'] ?? 'active',
    ]);
    success(['id' => (int)db()->lastInsertId()], 'Food item created');
}

// ── UPDATE FOOD (admin) ───────────────────────────────────────
function updateFood(): void {
    requireAdmin();
    $id   = (int)($_GET['id'] ?? 0);
    if (!$id) error('Food ID required');
    $body = getBody();

    $fields = [];
    $params = [];
    $map = ['name'=>'name','emoji'=>'emoji','description'=>'description',
            'price'=>'price','type'=>'type','status'=>'status','category_id'=>'category_id'];
    foreach ($map as $key => $col) {
        if (isset($body[$key])) { $fields[] = "$col = ?"; $params[] = $body[$key]; }
    }
    if (!$fields) error('Nothing to update');
    $params[] = $id;
    db()->prepare('UPDATE foods SET ' . implode(',', $fields) . ' WHERE id = ?')->execute($params);
    success(null, 'Food item updated');
}

// ── DELETE FOOD (admin) ───────────────────────────────────────
function deleteFood(): void {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) error('Food ID required');
    $stmt = db()->prepare('DELETE FROM foods WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) error('Food not found', 404);
    success(null, 'Food item deleted');
}
