<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

// Selalu kembalikan struktur respons yang konsisten agar frontend bisa
// memutuskan dengan aman apakah perlu mempercayai localStorage atau tidak.
$response = [
    'success' => true,
    'loggedIn' => false,
    'isAdmin' => false,
];

if (isset($_SESSION['id_surfer'])) {
    $id = $_SESSION['id_surfer'];
    $stmt = $conn->prepare("SELECT name FROM surfer WHERE id_surfer = ? LIMIT 1");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $res = $stmt->get_result();
    $name = null;
    if ($row = $res->fetch_assoc()) $name = $row['name'];
    $stmt->close();

    $response = array_merge($response, [
        'loggedIn' => true,
        'id_surfer' => intval($id),
        'name' => $name,
        'isAdmin' => !empty($_SESSION['isAdmin']) ? true : false,
    ]);
} elseif (!empty($_SESSION['isAdmin'])) {
    $response = array_merge($response, [
        'loggedIn' => true,
        'isAdmin' => true,
    ]);
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
$conn->close();

?>
