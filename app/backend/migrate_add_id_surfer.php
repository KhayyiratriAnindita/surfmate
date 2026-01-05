<?php
// One-time migration to add `id_surfer` column to `reservasi` table if missing.
// Run this by opening the URL in your browser: /app/backend/migrate_add_id_surfer.php

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

try {
    // Check if column exists
    $chk = $conn->query("SHOW COLUMNS FROM reservasi LIKE 'id_surfer'");
    if ($chk && $chk->num_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Column id_surfer already exists']);
        exit;
    }

    // Add the column as nullable int and add an index
    $sql = "ALTER TABLE reservasi ADD COLUMN id_surfer INT NULL AFTER status";
    if (!$conn->query($sql)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Alter failed', 'details' => $conn->error]);
        exit;
    }

    // Optionally add index for faster lookups
    $idxSql = "ALTER TABLE reservasi ADD INDEX idx_id_surfer (id_surfer)";
    if (!$conn->query($idxSql)) {
        // not fatal
        error_log('Failed to add index idx_id_surfer: ' . $conn->error);
    }

    echo json_encode(['success' => true, 'message' => 'id_surfer column added (nullable).']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();

?>
<?php
// One-time migration: add `id_surfer` column to `reservasi` if missing.
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

try {
    $colRes = $conn->query("SHOW COLUMNS FROM reservasi LIKE 'id_surfer'");
    if ($colRes && $colRes->num_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Column id_surfer already exists']);
        exit;
    }

    $res = $conn->query("ALTER TABLE reservasi ADD COLUMN id_surfer INT NULL AFTER id_reservasi");
    if ($res === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $conn->error]);
        exit;
    }

    echo json_encode(['success' => true, 'message' => 'Column id_surfer added']);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $ex->getMessage()]);
}

$conn->close();

?>
