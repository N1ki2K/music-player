<?php
$servername = "localhost";
$username = "music_user";
$password = "music_pass";
$dbname = "music_player";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>