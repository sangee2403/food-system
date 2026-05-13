<?php
// ══════════════════════════════════════════════════════════════
//  ANNAPOORNA – AUTH API
//  File: backend/api/auth.php
//  Routes handled by ?action= query param:
//    POST register  – create new account
//    POST login     – login, get JWT
//    GET  me        – fetch logged-in user info
//    POST logout    – (stateless JWT, no server action needed)
// ══════════════════════════════════════════════════════════════

require_once __DIR__ . '/../config/helpers.php';
setCorsHeaders();

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

match ("$method:$action") {
    'POST:register' => handleRegister(),
    'POST:login'    => handleLogin(),
    'GET:me'        => handleMe(),
    default         => error("Unknown action: $action", 404),
};

// ── REGISTER ─────────────────────────────────────────────────
function handleRegister(): void {
    $body = getBody();
    $errs = validate($body, [
        'name'     => 'required|min:2|max:120',
        'email'    => 'required|email|max:180',
        'password' => 'required|min:6|max:72',
    ]);
    if ($errs) error('Validation failed', 422, $errs);

    $pdo = db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([strtolower(trim($body['email']))]);
    if ($stmt->fetch()) error('Email is already registered', 409);

    $hash = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
    $stmt = $pdo->prepare(
        'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([
        trim($body['name']),
        strtolower(trim($body['email'])),
        trim($body['phone'] ?? ''),
        $hash,
    ]);
    $userId = (int)$pdo->lastInsertId();
    $user   = fetchUser($userId);
    $token  = generateToken(['sub' => $userId, 'role' => 'user']);

    success(['user' => sanitizeUser($user), 'token' => $token], 'Account created successfully');
}

// ── LOGIN ─────────────────────────────────────────────────────
function handleLogin(): void {
    $body = getBody();
    $errs = validate($body, [
        'email'    => 'required|email',
        'password' => 'required',
    ]);
    if ($errs) error('Validation failed', 422, $errs);

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? AND status = "active"');
    $stmt->execute([strtolower(trim($body['email']))]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($body['password'], $user['password'])) {
        error('Invalid email or password', 401);
    }

    $token = generateToken(['sub' => $user['id'], 'role' => $user['role']]);
    success(['user' => sanitizeUser($user), 'token' => $token], 'Login successful');
}

// ── ME ───────────────────────────────────────────────────────
function handleMe(): void {
    $auth = requireAuth();
    $user = fetchUser($auth['sub']);
    if (!$user) error('User not found', 404);
    success(sanitizeUser($user));
}

// ── HELPERS ──────────────────────────────────────────────────
function fetchUser(int $id): ?array {
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$id]);
    return $stmt->fetch() ?: null;
}

function sanitizeUser(array $u): array {
    unset($u['password']);
    return $u;
}
