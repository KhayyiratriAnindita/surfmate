<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

// If client requests own reviews, use session id if available
$own = isset($_GET['own']) ? intval($_GET['own']) : 0;
$id_surfer = null;
if ($own === 1) {
    $id_surfer = $_SESSION['id_surfer'] ?? null;
}
// allow explicit id_surfer override (but session preferred)
if (!$id_surfer && isset($_GET['id_surfer'])) {
    $id_surfer = intval($_GET['id_surfer']);
}

if ($id_surfer) {
    $stmt = $conn->prepare("SELECT u.id_ulasan, u.id_surfer, u.comment, u.tgl_ulasan, s.name AS surfer_name FROM ulasan u LEFT JOIN surfer s ON u.id_surfer = s.id_surfer WHERE u.id_surfer = ? ORDER BY u.tgl_ulasan DESC");
    $stmt->bind_param('i', $id_surfer);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    // return all reviews
    $sql = "SELECT u.id_ulasan, u.id_surfer, u.comment, u.tgl_ulasan, s.name AS surfer_name FROM ulasan u LEFT JOIN surfer s ON u.id_surfer = s.id_surfer ORDER BY u.tgl_ulasan DESC";
    $result = $conn->query($sql);
}

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $conn->error]);
    exit;
}

$rows = [];
while ($row = $result->fetch_assoc()) {
    // Admin or owner can delete their own review (isAdmin must be true boolean)
    $currentUser = $_SESSION['id_surfer'] ?? null;
    $isAdmin = ($_SESSION['isAdmin'] ?? false) === true;
    $row['can_delete'] = ($isAdmin || ($currentUser && intval($currentUser) === intval($row['id_surfer'])));
    $rows[] = $row;
}

echo json_encode($rows, JSON_UNESCAPED_UNICODE);

$conn->close();

