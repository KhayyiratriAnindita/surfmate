<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$n = isset($_GET['n']) ? intval($_GET['n']) : 50;
if ($n <= 0) $n = 50;

$sql = sprintf('SELECT id_reservasi, nama_lengkap, id_paket, tanggal_reservasi, no_hp, harga, status FROM reservasi ORDER BY id_reservasi DESC LIMIT %d', $n);
$res = $conn->query($sql);
if (!$res) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Query failed: ' . $conn->error]);
    exit;
}

$rows = [];
while ($r = $res->fetch_assoc()) {
    $rows[] = $r;
}

echo json_encode(['success' => true, 'count' => count($rows), 'rows' => $rows]);

$conn->close();

?>
