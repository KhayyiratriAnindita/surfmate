<?php
// Gunakan environment variables dari docker-compose
$host = getenv('DB_HOST') ?: 'db';
$user = getenv('DB_USER') ?: 'user';
$pass = getenv('DB_PASSWORD') ?: '';
$db   = getenv('DB_NAME') ?: 'db_surfmate';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Database error: " . $conn->connect_error);
}

// pastikan charset agar tidak bermasalah saat menyimpan UTF-8
$conn->set_charset('utf8mb4');
?>
