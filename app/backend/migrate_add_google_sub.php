<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

// Migrasi ringan: tambahkan kolom google_sub (Google User ID) untuk surfer & admin.
// Aman dijalankan berkali-kali: akan cek dulu keberadaan kolom/index.

function column_exists(mysqli $conn, string $table, string $column): bool {
    $dbRes = $conn->query('SELECT DATABASE() AS db');
    $db = $dbRes ? ($dbRes->fetch_assoc()['db'] ?? null) : null;
    if (!$db) return false;

    $stmt = $conn->prepare('SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?');
    $stmt->bind_param('sss', $db, $table, $column);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmt->close();
    return $row && intval($row['c']) > 0;
}

function index_exists(mysqli $conn, string $table, string $indexName): bool {
    $stmt = $conn->prepare("SHOW INDEX FROM `$table` WHERE Key_name = ?");
    $stmt->bind_param('s', $indexName);
    $stmt->execute();
    $res = $stmt->get_result();
    $exists = ($res && $res->num_rows > 0);
    $stmt->close();
    return $exists;
}

$out = ['success' => true, 'applied' => []];

try {
    // surfer.google_sub
    if (!column_exists($conn, 'surfer', 'google_sub')) {
        $conn->query("ALTER TABLE surfer ADD COLUMN google_sub VARCHAR(64) DEFAULT NULL");
        $out['applied'][] = 'ALTER TABLE surfer ADD COLUMN google_sub';
    }
    if (!index_exists($conn, 'surfer', 'uniq_surfer_google_sub')) {
        // UNIQUE index: beberapa NULL tetap boleh
        $conn->query("ALTER TABLE surfer ADD UNIQUE KEY uniq_surfer_google_sub (google_sub)");
        $out['applied'][] = 'ALTER TABLE surfer ADD UNIQUE KEY uniq_surfer_google_sub';
    }

    // admin.google_sub
    if (!column_exists($conn, 'admin', 'google_sub')) {
        $conn->query("ALTER TABLE admin ADD COLUMN google_sub VARCHAR(64) DEFAULT NULL");
        $out['applied'][] = 'ALTER TABLE admin ADD COLUMN google_sub';
    }
    if (!index_exists($conn, 'admin', 'uniq_admin_google_sub')) {
        $conn->query("ALTER TABLE admin ADD UNIQUE KEY uniq_admin_google_sub (google_sub)");
        $out['applied'][] = 'ALTER TABLE admin ADD UNIQUE KEY uniq_admin_google_sub';
    }

    echo json_encode($out, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

$conn->close();
