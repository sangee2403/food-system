<?php
// ══════════════════════════════════════════════════════════════
//  ANNAPOORNA – API HELPERS
//  File: backend/config/helpers.php
// ══════════════════════════════════════════════════════════════

require_once __DIR__ . '/database.php';

// ── CORS & HEADERS ───────────────────────────────────────────
function setCorsHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

// ── JSON RESPONSE ────────────────────────────────────────────
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function success(mixed $data = null, string $message = 'Success'): void {
    jsonResponse(['success' => true, 'message' => $message, 'data' => $data]);
}

function error(string $message, int $code = 400, mixed $errors = null): void {
    jsonResponse(['success' => false, 'message' => $message, 'errors' => $errors], $code);
}

// ── REQUEST PARSING ──────────────────────────────────────────
function getBody(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return $_POST;
    $json = json_decode($raw, true);
    return is_array($json) ? $json : $_POST;
}

function getParam(string $key, mixed $default = null): mixed {
    $body = getBody();
    return $body[$key] ?? $_GET[$key] ?? $_POST[$key] ?? $default;
}

// ── VALIDATION ───────────────────────────────────────────────
function validate(array $data, array $rules): array {
    $errors = [];
    foreach ($rules as $field => $rule) {
        $parts = explode('|', $rule);
        $val   = $data[$field] ?? null;
        foreach ($parts as $r) {
            [$rName, $rArg] = array_pad(explode(':', $r, 2), 2, null);
            switch ($rName) {
                case 'required':
                    if ($val === null || $val === '') $errors[$field][] = "$field is required";
                    break;
                case 'email':
                    if ($val && !filter_var($val, FILTER_VALIDATE_EMAIL))
                        $errors[$field][] = "$field must be a valid email";
                    break;
                case 'min':
                    if ($val !== null && strlen((string)$val) < (int)$rArg)
                        $errors[$field][] = "$field must be at least $rArg characters";
                    break;
                case 'max':
                    if ($val !== null && strlen((string)$val) > (int)$rArg)
                        $errors[$field][] = "$field may not exceed $rArg characters";
                    break;
                case 'numeric':
                    if ($val !== null && !is_numeric($val))
                        $errors[$field][] = "$field must be a number";
                    break;
                case 'in':
                    $allowed = explode(',', $rArg);
                    if ($val && !in_array($val, $allowed))
                        $errors[$field][] = "$field must be one of: $rArg";
                    break;
            }
        }
    }
    return $errors;
}

// ── AUTH / JWT (simple HMAC token) ───────────────────────────
function generateToken(array $payload): string {
    $header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + 86400 * 7; // 7 days
    $body    = base64url_encode(json_encode($payload));
    $sig     = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function verifyToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64url_decode($body), true);
    if (!$payload || ($payload['exp'] ?? 0) < time()) return null;
    return $payload;
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

function getAuthUser(): ?array {

    $headers = getallheaders();

    $header = $headers['Authorization']
        ?? $headers['authorization']
        ?? $_SERVER['HTTP_AUTHORIZATION']
        ?? '';

    if (preg_match('/Bearer\s+(.+)/i', $header, $m)) {
        return verifyToken($m[1]);
    }

    return null;
}

function requireAuth(): array {
    $user = getAuthUser();
    if (!$user) error('Unauthorized – please login', 401);
    return $user;
}

function requireAdmin(): array {
    $user = requireAuth();
    if (($user['role'] ?? '') !== 'admin') error('Forbidden – admin only', 403);
    return $user;
}

// ── GENERATE ORDER CODE ──────────────────────────────────────
function generateOrderCode(): string {
    return 'ORD' . strtoupper(substr(uniqid('', true), -8));
}
