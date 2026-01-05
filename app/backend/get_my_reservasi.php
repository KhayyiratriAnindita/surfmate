<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once __DIR__ . '/db.php';

if (empty($_SESSION['id_surfer'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$id_surfer = intval($_SESSION['id_surfer']);
// ensure id_surfer column exists
$hasIdSurfer = false;
try {
    $colRes = $conn->query("SHOW COLUMNS FROM reservasi LIKE 'id_surfer'");
    if ($colRes && $colRes->num_rows > 0) $hasIdSurfer = true;
} catch (Exception $ex) { $hasIdSurfer = false; }

if (!$hasIdSurfer) {
    echo json_encode(['success' => false, 'error' => 'Server not configured for user reservations (missing id_surfer column)']);
    exit;
}

$stmt = $conn->prepare("SELECT r.id_reservasi, r.nama_lengkap, r.id_paket, p.nama_paket AS paket, r.tanggal_reservasi, r.no_hp, r.harga, r.status FROM reservasi r LEFT JOIN paket p ON r.id_paket = p.id_paket WHERE r.id_surfer = ? AND (r.status IS NULL OR r.status <> 'cancelled') ORDER BY r.id_reservasi DESC");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param('i', $id_surfer);
$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($r = $res->fetch_assoc()) $rows[] = $r;

echo json_encode(['success' => true, 'count' => count($rows), 'rows' => $rows]);

$conn->close();
?>
