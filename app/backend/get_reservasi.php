<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
// optional filter: status
$status = isset($_GET['status']) ? trim($_GET['status']) : null;

$sql = 'SELECT r.id_reservasi, r.nama_lengkap, r.id_paket, p.nama_paket AS paket, r.tanggal_reservasi, r.no_hp, r.harga, r.status FROM reservasi r LEFT JOIN paket p ON r.id_paket = p.id_paket';
if ($status) {
    $stmt = $conn->prepare($sql . ' WHERE r.status = ? ORDER BY r.id_reservasi DESC');
    $stmt->bind_param('s', $status);
} else {
    $stmt = $conn->prepare($sql . ' ORDER BY r.id_reservasi DESC');
}

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    exit;
}

$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($r = $res->fetch_assoc()) {
    $rows[] = $r;
}

echo json_encode(['success' => true, 'count' => count($rows), 'rows' => $rows]);

$conn->close();

?>
