<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once __DIR__ . '/db.php';

if (empty($_SESSION['id_surfer'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$status = isset($_POST['status']) ? trim($_POST['status']) : '';

if ($id <= 0 || $status === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
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

// verify ownership
$check = $conn->prepare('SELECT id_surfer FROM reservasi WHERE id_reservasi = ? LIMIT 1');
if (!$check) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    exit;
}
$check->bind_param('i', $id);
$check->execute();
$res = $check->get_result();
if (!$res || $res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Reservation not found']);
    exit;
}
$row = $res->fetch_assoc();
if (intval($row['id_surfer']) !== $id_surfer) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Forbidden']);
    exit;
}

// If surfer requests cancellation, delete the reservation instead of setting status
if ($status === 'cancelled') {
    $del = $conn->prepare('DELETE FROM reservasi WHERE id_reservasi = ? AND id_surfer = ?');
    if (!$del) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
        exit;
    }
    $del->bind_param('ii', $id, $id_surfer);
    if ($del->execute()) {
        echo json_encode(['success' => true, 'deleted_rows' => $del->affected_rows]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $del->error]);
    }
    $del->close();
} else {
    // Otherwise perform a status update (e.g., undo -> pending)
    $stmt = $conn->prepare('UPDATE reservasi SET status = ? WHERE id_reservasi = ?');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param('si', $status, $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'affected_rows' => $stmt->affected_rows]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    $stmt->close();
}

$conn->close();
?>
