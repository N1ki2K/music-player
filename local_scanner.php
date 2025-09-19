<?php
include 'db_connect.php';
require_once 'getid3/getid3.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    switch ($action) {
        case 'scan_directory':
            $directory = $input['directory'] ?? '';
            if (!$directory || !is_dir($directory)) {
                echo json_encode(['success' => false, 'message' => 'Invalid directory']);
                exit;
            }

            $musicFiles = [];
            $audioExtensions = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'];
            $getID3 = new getID3();

            $files = scandir($directory);
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;

                $fullPath = $directory . '/' . $file;
                $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

                if (is_file($fullPath) && in_array($extension, $audioExtensions)) {
                    // Extract metadata from audio file
                    $metadata = $getID3->analyze($fullPath);

                    // Get track info from metadata, fallback to filename parsing
                    $title = '';
                    $artist = '';
                    $album = '';
                    $duration = 0;

                    if (isset($metadata['tags'])) {
                        // Try ID3v2, then ID3v1, then other tag formats
                        $tags = $metadata['tags'];

                        if (isset($tags['id3v2'])) {
                            $tagData = $tags['id3v2'];
                        } elseif (isset($tags['id3v1'])) {
                            $tagData = $tags['id3v1'];
                        } elseif (isset($tags['vorbiscomment'])) {
                            $tagData = $tags['vorbiscomment'];
                        } elseif (isset($tags['ape'])) {
                            $tagData = $tags['ape'];
                        } else {
                            $tagData = reset($tags); // Get first available tag format
                        }

                        $title = isset($tagData['title'][0]) ? $tagData['title'][0] : '';
                        $artist = isset($tagData['artist'][0]) ? $tagData['artist'][0] : '';
                        $album = isset($tagData['album'][0]) ? $tagData['album'][0] : '';
                    }

                    // Get duration from metadata
                    if (isset($metadata['playtime_seconds'])) {
                        $duration = (int) $metadata['playtime_seconds'];
                    }

                    // Fallback to filename parsing if no metadata
                    if (empty($title) && empty($artist)) {
                        $filename = pathinfo($file, PATHINFO_FILENAME);
                        $parts = explode(' - ', $filename, 2);
                        $artist = isset($parts[0]) ? trim($parts[0]) : '';
                        $title = isset($parts[1]) ? trim($parts[1]) : $filename;
                    }

                    // Use filename as title if still empty
                    if (empty($title)) {
                        $title = pathinfo($file, PATHINFO_FILENAME);
                    }

                    $musicFiles[] = [
                        'filename' => $file,
                        'filepath' => $fullPath,
                        'suggested_title' => $title,
                        'suggested_artist' => $artist,
                        'suggested_album' => $album,
                        'duration' => $duration,
                        'size' => filesize($fullPath),
                        'modified' => date('Y-m-d H:i:s', filemtime($fullPath)),
                        'bitrate' => isset($metadata['audio']['bitrate']) ? $metadata['audio']['bitrate'] : 0,
                        'format' => isset($metadata['fileformat']) ? $metadata['fileformat'] : $extension
                    ];
                }
            }

            echo json_encode(['success' => true, 'files' => $musicFiles]);
            break;

        case 'add_local_file':
            $filepath = $input['filepath'] ?? '';
            $title = $input['title'] ?? '';
            $artist = $input['artist'] ?? '';
            $album = $input['album'] ?? '';

            if (!$filepath || !$title || !$artist) {
                echo json_encode(['success' => false, 'message' => 'Missing required fields']);
                exit;
            }

            if (!file_exists($filepath)) {
                echo json_encode(['success' => false, 'message' => 'File does not exist']);
                exit;
            }

            // Check if file already exists in database
            $checkStmt = $conn->prepare("SELECT id FROM songs WHERE filepath = ?");
            $checkStmt->bind_param("s", $filepath);
            $checkStmt->execute();
            $result = $checkStmt->get_result();

            if ($result->num_rows > 0) {
                echo json_encode(['success' => false, 'message' => 'File already in library']);
                $checkStmt->close();
                exit;
            }
            $checkStmt->close();

            // Get duration from file if not provided
            $duration = $input['duration'] ?? 0;
            if ($duration == 0) {
                $getID3 = new getID3();
                $metadata = $getID3->analyze($filepath);
                if (isset($metadata['playtime_seconds'])) {
                    $duration = (int) $metadata['playtime_seconds'];
                }
            }

            // Add to database
            $stmt = $conn->prepare("INSERT INTO songs (title, artist, album, filepath, duration) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssi", $title, $artist, $album, $filepath, $duration);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'File added to library']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Database error']);
            }
            $stmt->close();
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$conn->close();
?>