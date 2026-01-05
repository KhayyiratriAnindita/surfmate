<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

// surfer masuk melalui sesi
$id_surfer = $_SESSION['id_surfer'] ?? null;

// terima 'comment' atau 'komentar' 
$comment = $_POST['comment'] ?? $_POST['komentar'] ?? null;

if (!$id_surfer) {
    http_response_code(401);
    echo json_encode(['error' => 'Login required to submit feedback']);
    exit;
}

if (!$comment) {
    http_response_code(400);
    echo json_encode(['error' => 'Komentar wajib diisi']);
    exit;
}

// masukkan nama kolom pertama (isi_ulasan)
$tryInsert = function($colName) use ($conn, $id_surfer, $comment) {
    $sql = "INSERT INTO ulasan (id_surfer, " . $colName . ") VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return ['ok' => false, 'error' => 'prepare_failed', 'details' => $conn->error];
    }
    $stmt->bind_param("is", $id_surfer, $comment);
    $res = $stmt->execute();
    $insertId = $stmt->insert_id;
    $err = $stmt->error;
    $stmt->close();
    return ['ok' => $res, 'insert_id' => $insertId, 'error' => $err];
};

// lihat kolom yg ada di db 
$candidates = ['comment', 'isi_ulasan'];
$primaryCol = null;
foreach ($candidates as $c) {
    $chk = $conn->query("SHOW COLUMNS FROM ulasan LIKE '" . $conn->real_escape_string($c) . "'");
    if ($chk && $chk->num_rows > 0) {
        $primaryCol = $c;
        break;
    }
}

// default ke 'comment' kalau kolom tak ada
if (!$primaryCol) $primaryCol = 'comment';

$result = $tryInsert($primaryCol);
if ($result['ok']) {
    echo json_encode(['success' => true, 'id_ulasan' => $result['insert_id']]);
    $conn->close();
    exit;
}

// jika persiapan/eksekusi gagal
$lowerErr = strtolower($result['error'] ?: $conn->error);
if (strpos($lowerErr, 'unknown column') !== false || strpos($lowerErr, 'column') !== false) {
    error_log("createFeedback: primary insert failed (will try fallback). Error: " . ($result['error'] ?: $conn->error));
    $result2 = $tryInsert($fallbackCol);
    if ($result2['ok']) {
        echo json_encode(['success' => true, 'id_ulasan' => $result2['insert_id'], 'used_column' => $fallbackCol]);
        $conn->close();
        exit;
    }
    // ffallback gagal
    error_log("createFeedback: fallback insert also failed. Error: " . $result2['error']);
    http_response_code(500);
    echo json_encode(['error' => 'Gagal menyimpan ulasan (fallback)', 'details' => $result2['error']]);
    $conn->close();
    exit;
}

// mengembalikan kegagalan
error_log("createFeedback: insert failed. Error: " . ($result['error'] ?: $conn->error));
http_response_code(500);
echo json_encode(['error' => 'Gagal menyimpan ulasan', 'details' => ($result['error'] ?: $conn->error)]);
$conn->close();
exit;
?>
