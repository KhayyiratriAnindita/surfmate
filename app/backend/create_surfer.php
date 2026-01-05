<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
include 'db.php';

$name     = $_POST['name'] ?? '';
$email    = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(["status"=>"error","message"=>"Semua field harus diisi"]);
    exit;
}

// hash password
$hash = password_hash($password, PASSWORD_DEFAULT);

// cek email unik
// ensure proper charset
$conn->set_charset('utf8mb4');

// check prepare for duplicate email check
$cek = $conn->prepare("SELECT id_surfer FROM surfer WHERE email = ?");
if (!$cek) {
    echo json_encode(["status"=>"error","message"=>"DB prepare failed (dup check): " . $conn->error]);
    exit;
}
$cek->bind_param("s", $email);
if (!$cek->execute()) {
    echo json_encode(["status"=>"error","message"=>"DB execute failed (dup check): " . $cek->error]);
    exit;
}
$cek->store_result();

if ($cek->num_rows > 0) {
    echo json_encode(["status"=>"error","message"=>"Email sudah terdaftar"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO surfer (name, email, password) VALUES (?, ?, ?)");
if (!$stmt) {
    echo json_encode(["status"=>"error","message"=>"DB prepare failed (insert): " . $conn->error]);
    exit;
}
$stmt->bind_param("sss", $name, $email, $hash);

if ($stmt->execute()) {
    echo json_encode(["status"=>"success","message"=>"Pendaftaran berhasil","insert_id"=> $stmt->insert_id, "db_host"=> $host]);
} else {
    echo json_encode(["status"=>"error","message"=>"Gagal menyimpan data: " . $stmt->error, "db_host"=> $host]);
}
