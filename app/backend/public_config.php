<?php
header('Content-Type: application/json; charset=utf-8');

// Konfigurasi publik yang aman untuk dibaca frontend.
// Catatan: CLIENT ID bukan rahasia (boleh ditampilkan), yang rahasia adalah CLIENT SECRET.
$googleClientId = getenv('GOOGLE_CLIENT_ID');

if ($googleClientId !== false && $googleClientId !== null) {
    $googleClientId = trim((string) $googleClientId);
}

if ($googleClientId === '' || $googleClientId === false) {
    $googleClientId = null;
}

echo json_encode([
    'success' => true,
    'googleClientId' => $googleClientId,
], JSON_UNESCAPED_UNICODE);
