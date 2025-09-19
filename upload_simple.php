<?php
header('Content-Type: application/json');

try {
    include 'db_connect.php';

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $title = $_POST['title'] ?? '';
        $artist = $_POST['artist'] ?? '';
        $album = $_POST['album'] ?? '';

        if (empty($title) || empty($artist)) {
            echo json_encode(['success' => false, 'message' => 'Title and artist are required']);
            exit;
        }

        // Debug file upload
        error_log('FILES array: ' . print_r($_FILES, true));

        // Handle file upload without getID3 for now
        if (isset($_FILES['music_file'])) {
            $upload_error = $_FILES['music_file']['error'];
            error_log('Upload error code: ' . $upload_error);

            if ($upload_error === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileName = time() . '_' . basename($_FILES['music_file']['name']);
            $uploadPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['music_file']['tmp_name'], $uploadPath)) {
                // Simple insert without duration for now
                $duration = 0;
                $stmt = $conn->prepare("INSERT INTO songs (title, artist, album, filepath, duration) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("ssssi", $title, $artist, $album, $uploadPath, $duration);

                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Song uploaded successfully']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
                }
                $stmt->close();
            } else {
                echo json_encode(['success' => false, 'message' => 'File upload failed']);
            }
            } else {
                // Handle different upload errors
                $error_messages = [
                    UPLOAD_ERR_INI_SIZE => 'File too large (exceeds upload_max_filesize: ' . ini_get('upload_max_filesize') . ')',
                    UPLOAD_ERR_FORM_SIZE => 'File too large (exceeds MAX_FILE_SIZE: 50MB)',
                    UPLOAD_ERR_PARTIAL => 'File upload interrupted',
                    UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                    UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                    UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                    UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
                ];

                $error_msg = $error_messages[$upload_error] ?? 'Unknown upload error: ' . $upload_error;
                echo json_encode(['success' => false, 'message' => $error_msg]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No file field found in upload']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

if (isset($conn)) {
    $conn->close();
}
?>