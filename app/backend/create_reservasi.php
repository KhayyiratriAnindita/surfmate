<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

session_start();

// write initial debug snapshot for every request
$initialLog = [
    'time' => date('c'),
    'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? null,
    'request_uri' => $_SERVER['REQUEST_URI'] ?? null,
    'post' => $_POST,
];
$logFile = __DIR__ . '/reservasi_debug.log';
$written = file_put_contents($logFile, json_encode($initialLog) . "\n", FILE_APPEND | LOCK_EX);
if ($written === false) {
    error_log("[create_reservasi] cannot write initial debug to $logFile");
}

$name = trim($_POST['nama_lengkap'] ?? '');
$id_paket = isset($_POST['id_paket']) ? intval($_POST['id_paket']) : 0;
$tanggal = trim($_POST['tanggal_reservasi'] ?? '');
$no_hp = trim($_POST['no_hp'] ?? '');

$errors = [];
if ($name === '') $errors[] = 'Nama lengkap wajib diisi.';
if ($id_paket <= 0) $errors[] = 'Pilih paket yang valid.';
if ($tanggal === '') $errors[] = 'Tanggal reservasi wajib diisi.';
if ($no_hp === '') $errors[] = 'Nomor HP wajib diisi.';

// validasi format YYYY-MM-DD
if ($tanggal !== '') {
    $d = DateTime::createFromFormat('Y-m-d', $tanggal);
    if (!($d && $d->format('Y-m-d') === $tanggal)) {
        $errors[] = 'Format tanggal tidak valid. Gunakan YYYY-MM-DD.';
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// liat harga paket
$stmt = $conn->prepare('SELECT nama_paket, harga FROM paket WHERE id_paket = ? LIMIT 1');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Query prepare gagal: ' . $conn->error]);
    exit;
}
$stmt->bind_param('i', $id_paket);
$stmt->execute();
$res = $stmt->get_result();
if (!$res || $res->num_rows === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Paket tidak ditemukan.']);
    exit;
}
$paket = $res->fetch_assoc();
$harga = floatval($paket['harga']);

// deteksi kolom id_surfer and memasukkan sesi terkini  surfer
$hasIdSurfer = false;
try {
    $colRes = $conn->query("SHOW COLUMNS FROM reservasi LIKE 'id_surfer'");
    if ($colRes && $colRes->num_rows > 0) $hasIdSurfer = true;
} catch (Exception $ex) { $hasIdSurfer = false; }

$id_surfer = isset($_SESSION['id_surfer']) ? intval($_SESSION['id_surfer']) : null;

if ($hasIdSurfer && $id_surfer) {
    $ins = $conn->prepare('INSERT INTO reservasi (id_surfer, nama_lengkap, id_paket, tanggal_reservasi, no_hp, harga) VALUES (?, ?, ?, ?, ?, ?)');
    if (!$ins) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Gagal menyiapkan query insert: ' . $conn->error]);
        exit;
    }
    $ins->bind_param('issssd', $id_surfer, $name, $id_paket, $tanggal, $no_hp, $harga);
} else {
    $ins = $conn->prepare('INSERT INTO reservasi (nama_lengkap, id_paket, tanggal_reservasi, no_hp, harga) VALUES (?, ?, ?, ?, ?)');
    if (!$ins) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Gagal menyiapkan query insert: ' . $conn->error]);
        exit;
    }
    $ins->bind_param('sissd', $name, $id_paket, $tanggal, $no_hp, $harga);
}

if ($ins->execute()) {
    $insertId = $conn->insert_id;
    // vefifikasi data yg baru dimasukkan
    if (!empty($hasIdSurfer)) {
        $verify = $conn->prepare('SELECT id_reservasi, id_surfer, nama_lengkap, id_paket, tanggal_reservasi, no_hp, harga, status FROM reservasi WHERE id_reservasi = ? LIMIT 1');
    } else {
        $verify = $conn->prepare('SELECT id_reservasi, nama_lengkap, id_paket, tanggal_reservasi, no_hp, harga, status FROM reservasi WHERE id_reservasi = ? LIMIT 1');
    }
    if ($verify) {
        $verify->bind_param('i', $insertId);
        $verify->execute();
        $r = $verify->get_result()->fetch_assoc();
    } else {
        $r = null;
    }

    // koleksi info database
    $currentDb = null;
    try {
        $dbRes = $conn->query('SELECT DATABASE() as db');
        if ($dbRes) {
            $rowDb = $dbRes->fetch_assoc();
            $currentDb = $rowDb['db'] ?? null;
        }
    } catch (Exception $ex) { $currentDb = null; }

    // tulis log debug lengkap
    $logData = [
        'time' => date('c'),
        'insertId' => $insertId,
            'payload' => ['id_surfer'=>$id_surfer,'nama_lengkap'=>$name,'id_paket'=>$id_paket,'tanggal_reservasi'=>$tanggal,'no_hp'=>$no_hp,'harga'=>$harga],
        'select_result' => $r,
        'database' => $currentDb,
        'host_info' => $conn->host_info ?? null,
        'server_info' => $conn->server_info ?? null,
        'server_version' => $conn->server_version ?? null,
        'affected_rows' => $ins->affected_rows ?? null,
        'insert_errno' => $ins->errno ?? null,
        'insert_error' => $ins->error ?? null
    ];
    $log = json_encode($logData) . "\n";
    $res = file_put_contents(__DIR__ . '/reservasi_debug.log', $log, FILE_APPEND | LOCK_EX);
    if ($res === false) {
        error_log('[create_reservasi] failed to write debug log to reservasi_debug.log');
    }

    $response = ['success' => true, 'id_reservasi' => $insertId, 'harga' => number_format($harga,2,'.',''), 'paket' => $paket['nama_paket'], 'row' => $r, 'database' => $currentDb];
    if ($hasIdSurfer) $response['id_surfer'] = $id_surfer;
    echo json_encode($response);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Gagal menyimpan reservasi: ' . $ins->error]);
}

$conn->close();

?>
