<?php
// hash_migration.php
// WARNING: run this once after backing up your database. Removes plain-text passwords by hashing them.

ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'db.php';

$tables = ['surfer', 'admin'];

foreach ($tables as $table) {
    // get primary key column name
    $pkRes = $conn->query("SHOW KEYS FROM `$table` WHERE Key_name = 'PRIMARY'");
    $pkCol = null;
    if ($pkRes && $pkRow = $pkRes->fetch_assoc()) {
        $pkCol = $pkRow['Column_name'];
    }

    // select all rows (we'll inspect columns dynamically)
    $res = $conn->query("SELECT * FROM `$table`");

    if ($res) {
        while ($row = $res->fetch_assoc()) {
            if (!isset($row['password'])) continue;
            $current = $row['password'];
            $info = password_get_info($current);
            if ($info['algo'] === 0) {
                // not a PHP password hash yet — migrate
                $hash = password_hash($current, PASSWORD_DEFAULT);

                // determine id column value
                if ($pkCol && isset($row[$pkCol])) {
                    $idCol = $pkCol;
                    $idVal = $row[$pkCol];
                } else {
                    // fallback to common column names
                    if (isset($row['id_surfer'])) { $idCol = 'id_surfer'; $idVal = $row['id_surfer']; }
                    elseif (isset($row['id_admin'])) { $idCol = 'id_admin'; $idVal = $row['id_admin']; }
                    elseif (isset($row['id'])) { $idCol = 'id'; $idVal = $row['id']; }
                    elseif (isset($row['email'])) { $idCol = 'email'; $idVal = $row['email']; }
                    else { continue; }
                }

                // prepare update (if id column is email, bind as string)
                if ($idCol === 'email') {
                    $stmt = $conn->prepare("UPDATE `$table` SET password = ? WHERE `$idCol` = ?");
                    if ($stmt) {
                        $stmt->bind_param('ss', $hash, $idVal);
                        $stmt->execute();
                        echo "Migrated $table.$idCol=$idVal\n";
                    }
                } else {
                    $stmt = $conn->prepare("UPDATE `$table` SET password = ? WHERE `$idCol` = ?");
                    if ($stmt) {
                        $stmt->bind_param('si', $hash, $idVal);
                        $stmt->execute();
                        echo "Migrated $table.$idCol=$idVal\n";
                    }
                }
            } else {
                $ident = $row[$pkCol] ?? $row['id_surfer'] ?? $row['id_admin'] ?? $row['id'] ?? ($row['email'] ?? 'unknown');
                echo "Already hashed for $table id $ident\n";
            }
        }
    } else {
        echo "Table $table not present or query failed\n";
    }
}

echo "Migration finished. DELETE this file after use.\n";

?>
