<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$out = ['success' => true];

// Database yang sedang aktif
$dbRes = $conn->query('SELECT DATABASE() AS db');
$out['database'] = $dbRes ? ($dbRes->fetch_assoc()['db'] ?? null) : null;

// Info server
$out['server_info'] = $conn->server_info ?? null;
$out['server_version'] = $conn->server_version ?? null;

// Cek tabel ada atau tidak
$tablesRes = $conn->query("SHOW TABLES LIKE 'reservasi'");
$out['reservasi_table_exists'] = ($tablesRes && $tablesRes->num_rows > 0);

// Jumlah baris
if ($out['reservasi_table_exists']) {
    $cntRes = $conn->query('SELECT COUNT(*) AS c FROM reservasi');
    $out['reservasi_count'] = $cntRes ? intval($cntRes->fetch_assoc()['c']) : null;

    $last = $conn->query('SELECT id_reservasi, nama_lengkap, id_paket, tanggal_reservasi, no_hp, harga, status FROM reservasi ORDER BY id_reservasi DESC LIMIT 1');
    $out['reservasi_last'] = $last ? $last->fetch_assoc() : null;
} else {
    $out['reservasi_count'] = 0;
    $out['reservasi_last'] = null;
}

echo json_encode($out, JSON_PRETTY_PRINT);

$conn->close();

?>
