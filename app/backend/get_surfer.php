<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $conn->prepare("SELECT * FROM surfer WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // cek password hash
        if (password_verify($password, $user['password'])) {
            // clear any admin session so surfer login tidak mewarisi hak admin
            unset($_SESSION['isAdmin'], $_SESSION['id_admin'], $_SESSION['admin_email']);
            // regen session id to prevent fixation
            session_regenerate_id(true);

            // set session so backend can authenticate subsequent requests
            $_SESSION['id_surfer'] = $user['id_surfer'] ?? $user['id'] ?? null;
            $_SESSION['surfer_email'] = $user['email'];

            echo json_encode([
                'success' => true,
                'name' => $user['name'] ?? '',
                'email' => $user['email'] ?? ''
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Email atau password salah']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Email atau password salah']);
    }
}
?>
