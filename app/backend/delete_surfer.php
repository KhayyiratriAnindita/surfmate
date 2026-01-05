<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

if (empty($_SESSION['id_surfer'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$id = intval($_SESSION['id_surfer']);

// perform deletion in a transaction: feedback (ulasan), reservations (reservasi), then surfer
try {
    $conn->begin_transaction();

    // remove feedback
    $stmt = $conn->prepare('DELETE FROM ulasan WHERE id_surfer = ?');
    if ($stmt) { $stmt->bind_param('i', $id); $stmt->execute(); $stmt->close(); }

    // remove reservations
    $stmt = $conn->prepare('DELETE FROM reservasi WHERE id_surfer = ?');
    if ($stmt) { $stmt->bind_param('i', $id); $stmt->execute(); $stmt->close(); }

    // remove surfer record
    $stmt = $conn->prepare('DELETE FROM surfer WHERE id_surfer = ?');
    if ($stmt) { $stmt->bind_param('i', $id); $stmt->execute(); $affected = $stmt->affected_rows; $stmt->close(); }

    $conn->commit();

    // destroy session server-side
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'], $params['secure'], $params['httponly']
        );
    }
    session_destroy();

    echo json_encode(['success' => true, 'deleted' => intval($affected)]);
    exit;
} catch (Exception $ex) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $ex->getMessage()]);
    exit;
}
?>