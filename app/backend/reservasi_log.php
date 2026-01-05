<?php
header('Content-Type: application/json; charset=utf-8');

$logFile = __DIR__ . '/reservasi_debug.log';
$n = isset($_GET['n']) ? intval($_GET['n']) : 30;
if ($n <= 0) $n = 30;

if (!file_exists($logFile)) {
    echo json_encode(['success' => false, 'error' => 'File log tidak ditemukan', 'path' => $logFile]);
    exit;
}

$lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if ($lines === false) {
    echo json_encode(['success' => false, 'error' => 'Gagal membaca file log']);
    exit;
}

$total = count($lines);
$start = max(0, $total - $n);
$tail = array_slice($lines, $start, $n);
// Coba decode baris JSON agar output lebih rapi
$out = [];
foreach ($tail as $ln) {
    $j = json_decode($ln, true);
    $out[] = $j === null ? ['raw' => $ln] : $j;
}

echo json_encode(['success' => true, 'lines' => $out, 'count' => count($out)]);

?>