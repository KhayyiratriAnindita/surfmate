<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$id_ulasan = isset($_POST['id_ulasan']) ? intval($_POST['id_ulasan']) : null;
if (!$id_ulasan) {
    http_response_code(400);
    echo json_encode(['error' => 'id_ulasan required']);
    exit;
}

// Admin or owner can delete feedback
$isAdmin = $_SESSION['isAdmin'] ?? false;
$currentUser = $_SESSION['id_surfer'] ?? null;

// Fetch the review to check owner
$stmt = $conn->prepare("SELECT id_ulasan, id_surfer FROM ulasan WHERE id_ulasan = ?");
$stmt->bind_param('i', $id_ulasan);
$stmt->execute();
$res = $stmt->get_result();
if (!$res || $res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Review not found']);
    $stmt->close();
    $conn->close();
    exit;
}
$row = $res->fetch_assoc();
$stmt->close();

// Authorization: admin or owner of the review
if (!($isAdmin || ($currentUser && intval($currentUser) === intval($row['id_surfer'])))) {
    http_response_code(403);
    echo json_encode(['error' => 'Not authorized to delete this review']);
    $conn->close();
    exit;
}

// Perform delete
$del = $conn->prepare("DELETE FROM ulasan WHERE id_ulasan = ?");
$del->bind_param('i', $id_ulasan);
if ($del->execute()) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete', 'details' => $del->error]);
}
$del->close();
$conn->close();

?>
