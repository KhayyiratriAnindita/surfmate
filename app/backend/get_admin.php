<?php
session_start();
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $conn->prepare("SELECT * FROM admin WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $admin = $result->fetch_assoc();

        if (password_verify($password, $admin['password'])) {
            // clear surfer session so admin login tidak tercampur
            unset($_SESSION['id_surfer'], $_SESSION['surfer_email']);
            // regen session id to prevent fixation
            session_regenerate_id(true);

            // set session so backend can authenticate admin requests
            $_SESSION['isAdmin'] = true;
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['id_admin'] = $admin['id_admin'] ?? $admin['id'] ?? null;
            echo "success";
        } else {
            echo "Email atau password salah";
        }
    } else {
        echo "Email atau password salah";
    }
}
?>
