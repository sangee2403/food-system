<?php
// ══════════════════════════════════════════════════════════════
//  M.S. Pandi – DATABASE CONFIGURATION
//  File: backend/config/database.php
// ══════════════════════════════════════════════════════════════

define('DB_HOST', 'sql113.infinityfree.com');
define('DB_NAME', 'if0_41906544_XXX');
define('DB_USER', 'if0_41906544');
define('DB_PASS', 'sangeesugu');

define('APP_NAME',    'M.S. Pandi');
define('APP_VERSION', '1.0.0');
define('JWT_SECRET',  'M.S. Pandi_secret_key_2024_change_this');
define('BCRYPT_COST', 12);

// ── PDO SINGLETON ─────────────────────────────────────────────
class Database {
    private static ?PDO $instance = null;

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
            );
            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                die(json_encode([
                    'success' => false,
                    'message' => 'Database connection failed: ' . $e->getMessage()
                ]));
            }
        }
        return self::$instance;
    }

    // Prevent instantiation
    private function __construct() {}
    private function __clone() {}
}

// Convenience wrapper
function db(): PDO { return Database::getInstance(); }
