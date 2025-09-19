<?php
include 'db_connect.php';

$song_id = $_GET['id'] ?? 0;

if (!$song_id) {
    http_response_code(404);
    exit('Song not found');
}

// Get file path from database
$stmt = $conn->prepare("SELECT filepath, title, artist FROM songs WHERE id = ?");
$stmt->bind_param("i", $song_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    exit('Song not found');
}

$song = $result->fetch_assoc();
$filepath = $song['filepath'];

if (!file_exists($filepath)) {
    http_response_code(404);
    exit('File not found on disk');
}

// Set appropriate headers
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $filepath);
finfo_close($finfo);

// Fallback mime types for audio files
if (!$mime_type) {
    $ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));
    switch ($ext) {
        case 'mp3':
            $mime_type = 'audio/mpeg';
            break;
        case 'wav':
            $mime_type = 'audio/wav';
            break;
        case 'flac':
            $mime_type = 'audio/flac';
            break;
        case 'ogg':
            $mime_type = 'audio/ogg';
            break;
        case 'm4a':
            $mime_type = 'audio/mp4';
            break;
        default:
            $mime_type = 'application/octet-stream';
    }
}

header('Content-Type: ' . $mime_type);
header('Content-Length: ' . filesize($filepath));
header('Accept-Ranges: bytes');

// Support for range requests (for audio seeking)
if (isset($_SERVER['HTTP_RANGE'])) {
    $filesize = filesize($filepath);
    $range = $_SERVER['HTTP_RANGE'];

    if (preg_match('/bytes=(\d+)-(\d*)/', $range, $matches)) {
        $start = intval($matches[1]);
        $end = $matches[2] ? intval($matches[2]) : $filesize - 1;

        if ($start <= $end && $start < $filesize) {
            header('HTTP/1.1 206 Partial Content');
            header("Content-Range: bytes $start-$end/$filesize");
            header('Content-Length: ' . ($end - $start + 1));

            $file = fopen($filepath, 'rb');
            fseek($file, $start);
            echo fread($file, $end - $start + 1);
            fclose($file);
            exit;
        }
    }
}

// Serve the entire file
readfile($filepath);

$stmt->close();
$conn->close();
?>