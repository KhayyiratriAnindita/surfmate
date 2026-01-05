<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

// Endpoint untuk login/daftar menggunakan akun Google.
// Frontend mengirimkan ID Token (credential) dari Google Identity Services.

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Metode tidak didukung'], JSON_UNESCAPED_UNICODE);
    exit;
}

$credential = $_POST['credential'] ?? '';
if (!$credential) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Credential kosong'], JSON_UNESCAPED_UNICODE);
    exit;
}

$clientId = getenv('GOOGLE_CLIENT_ID');
if (empty($clientId)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'GOOGLE_CLIENT_ID belum diatur di environment container web',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function http_get_json($url) {
    // Pakai cURL bila tersedia, kalau tidak fallback ke file_get_contents.
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        $body = curl_exec($ch);
        $err  = curl_error($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body === false) {
            return [null, 0, $err ?: 'Gagal mengambil data'];
        }
        return [$body, $code, null];
    }

    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 10,
        ]
    ]);

    $body = @file_get_contents($url, false, $ctx);
    if ($body === false) {
        return [null, 0, 'Gagal mengambil data'];
    }

    // Ambil status code dari header bila ada
    $code = 200;
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $h) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) {
                $code = intval($m[1]);
                break;
            }
        }
    }

    return [$body, $code, null];
}

// Validasi ID Token via endpoint tokeninfo Google.
// Untuk produksi, verifikasi JWT signature lokal lebih ideal, tapi ini cukup aman untuk demo.
$tokenInfoUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential);
[$body, $code, $err] = http_get_json($tokenInfoUrl);

if ($body === null || $code >= 400) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Token Google tidak valid',
        'detail' => $err,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$info = json_decode($body, true);
if (!is_array($info)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Respons token tidak valid'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Pastikan token ditujukan untuk aplikasi ini
if (!empty($info['aud']) && $info['aud'] !== $clientId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Audience token tidak cocok'], JSON_UNESCAPED_UNICODE);
    exit;
}

$email = $info['email'] ?? '';
$emailVerified = $info['email_verified'] ?? '';
$sub = $info['sub'] ?? '';
$name = $info['name'] ?? ($info['given_name'] ?? '');

if (empty($email) || ($emailVerified !== 'true' && $emailVerified !== true)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Email Google belum terverifikasi'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($sub)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'ID Google tidak ditemukan'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($name)) {
    $name = explode('@', $email)[0];
}

// Cari user berdasarkan google_sub; jika belum ada, fallback ke email; jika tetap belum ada, buat akun baru.
$conn->set_charset('utf8mb4');

$row = null;
$stmt = $conn->prepare('SELECT id_surfer, name, email, google_sub FROM surfer WHERE google_sub = ? LIMIT 1');
$stmt->bind_param('s', $sub);
$stmt->execute();
$res = $stmt->get_result();
if ($res) $row = $res->fetch_assoc();
$stmt->close();

if (!$row) {
    $stmt = $conn->prepare('SELECT id_surfer, name, email, google_sub FROM surfer WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res) $row = $res->fetch_assoc();
    $stmt->close();
}

$idSurfer = null;
if ($row && !empty($row['id_surfer'])) {
    $idSurfer = intval($row['id_surfer']);
    // Jika ditemukan via email tapi google_sub belum tersimpan, simpan untuk login berikutnya
    if (empty($row['google_sub'])) {
        $up = $conn->prepare('UPDATE surfer SET google_sub = ? WHERE id_surfer = ?');
        $up->bind_param('si', $sub, $idSurfer);
        $up->execute();
        $up->close();
    }
} else {
    // Buat password acak (akun ini login via Google, bukan via password).
    $randomPassword = bin2hex(random_bytes(16));
    $hash = password_hash($randomPassword, PASSWORD_DEFAULT);

    $ins = $conn->prepare('INSERT INTO surfer (name, google_sub, email, password) VALUES (?, ?, ?, ?)');
    $ins->bind_param('ssss', $name, $sub, $email, $hash);
    if (!$ins->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Gagal membuat akun', 'detail' => $ins->error], JSON_UNESCAPED_UNICODE);
        $ins->close();
        $conn->close();
        exit;
    }
    $idSurfer = intval($ins->insert_id);
    $ins->close();
}

// Set session login
unset($_SESSION['isAdmin'], $_SESSION['id_admin'], $_SESSION['admin_email']);
session_regenerate_id(true);
$_SESSION['id_surfer'] = $idSurfer;
$_SESSION['surfer_email'] = $email;

echo json_encode([
    'success' => true,
    'id_surfer' => $idSurfer,
    'name' => $name,
    'email' => $email,
], JSON_UNESCAPED_UNICODE);

$conn->close();
