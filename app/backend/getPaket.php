<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$sql = "SELECT id_paket, nama_paket, harga FROM paket ORDER BY id_paket";
$res = $conn->query($sql);
$rows = [];
if ($res) {
    while ($r = $res->fetch_assoc()) {
        $rows[] = $r;
    }
}

echo json_encode($rows, JSON_UNESCAPED_UNICODE);

$conn->close();

?>
