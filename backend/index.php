<?php
// ══════════════════════════════════════════════════════════════
//  M.S. Pandi – API ROUTER
//  File: backend/index.php
//  Usage: /backend/?endpoint=auth&action=login
// ══════════════════════════════════════════════════════════════

require_once __DIR__ . '/config/helpers.php';
setCorsHeaders();

$endpoint = strtolower(trim($_GET['endpoint'] ?? ''));

$map = [
    'auth'    => __DIR__ . '/api/auth.php',
    'foods'   => __DIR__ . '/api/foods.php',
    'orders'  => __DIR__ . '/api/orders.php',
    'reviews' => __DIR__ . '/api/reviews.php',
    'admin'   => __DIR__ . '/api/admin.php',
];

if (isset($map[$endpoint])) {
    require $map[$endpoint];
} else {
    jsonResponse([
        'success' => true,
        'message' => 'M.S. Pandi API v1.0',
        'endpoints' => array_keys($map),
        'docs'    => 'See README.md for full API documentation',
    ]);
}
