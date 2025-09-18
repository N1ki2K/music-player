<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_songs':
        $sql = "SELECT * FROM songs";
        $result = $conn->query($sql);
        $songs = [];
        while ($row = $result->fetch_assoc()) {
            $songs[] = $row;
        }
        echo json_encode($songs);
        break;

    case 'get_playlists':
        $sql = "SELECT * FROM playlists";
        $result = $conn->query($sql);
        $playlists = [];
        while ($row = $result->fetch_assoc()) {
            $playlists[] = $row;
        }
        echo json_encode($playlists);
        break;

    case 'get_playlist_songs':
        $playlist_id = $_GET['playlist_id'] ?? 0;
        $sql = "SELECT s.* FROM songs s JOIN playlist_songs ps ON s.id = ps.song_id WHERE ps.playlist_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $playlist_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $playlist_songs = [];
        while ($row = $result->fetch_assoc()) {
            $playlist_songs[] = $row;
        }
        echo json_encode($playlist_songs);
        break;

    case 'create_playlist':
        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? '';
        if ($name) {
            $stmt = $conn->prepare("INSERT INTO playlists (name) VALUES (?)");
            $stmt->bind_param("s", $name);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'id' => $conn->insert_id]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Database error']);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'Name required']);
        }
        break;

    case 'delete_playlist':
        $input = json_decode(file_get_contents('php://input'), true);
        $playlist_id = $input['playlist_id'] ?? 0;
        if ($playlist_id) {
            $stmt = $conn->prepare("DELETE FROM playlists WHERE id = ?");
            $stmt->bind_param("i", $playlist_id);
            if ($stmt->execute()) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Database error']);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'Playlist ID required']);
        }
        break;

    case 'rename_playlist':
        $input = json_decode(file_get_contents('php://input'), true);
        $playlist_id = $input['playlist_id'] ?? 0;
        $new_name = $input['new_name'] ?? '';
        if ($playlist_id && $new_name) {
            $stmt = $conn->prepare("UPDATE playlists SET name = ? WHERE id = ?");
            $stmt->bind_param("si", $new_name, $playlist_id);
            if ($stmt->execute()) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Database error']);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'Playlist ID and name required']);
        }
        break;

    case 'add_song_to_playlist':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $playlist_id = $input['playlist_id'] ?? 0;
            $song_id = $input['song_id'] ?? 0;

            error_log("Adding song $song_id to playlist $playlist_id");

            if ($playlist_id && $song_id) {
                // First validate that playlist and song exist
                $validatePlaylist = $conn->prepare("SELECT id FROM playlists WHERE id = ?");
                $validatePlaylist->bind_param("i", $playlist_id);
                $validatePlaylist->execute();
                $playlistExists = $validatePlaylist->get_result()->num_rows > 0;
                $validatePlaylist->close();

                $validateSong = $conn->prepare("SELECT id FROM songs WHERE id = ?");
                $validateSong->bind_param("i", $song_id);
                $validateSong->execute();
                $songExists = $validateSong->get_result()->num_rows > 0;
                $validateSong->close();

                if (!$playlistExists) {
                    echo json_encode(['success' => false, 'message' => 'Playlist not found. Please refresh and try again.']);
                } elseif (!$songExists) {
                    echo json_encode(['success' => false, 'message' => 'Song not found. Please refresh and try again.']);
                } else {
                    // Check if song is already in playlist
                    $checkStmt = $conn->prepare("SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?");
                    $checkStmt->bind_param("ii", $playlist_id, $song_id);
                    $checkStmt->execute();
                    $result = $checkStmt->get_result();

                    if ($result->num_rows > 0) {
                        echo json_encode(['success' => false, 'message' => 'Song already in playlist']);
                    } else {
                        $stmt = $conn->prepare("INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)");
                        $stmt->bind_param("ii", $playlist_id, $song_id);
                        if ($stmt->execute()) {
                            echo json_encode(['success' => true, 'message' => 'Song added to playlist']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
                        }
                        $stmt->close();
                    }
                    $checkStmt->close();
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Playlist ID and Song ID required. Got: playlist=' . $playlist_id . ', song=' . $song_id]);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
        break;

    case 'delete_song':
        $input = json_decode(file_get_contents('php://input'), true);
        $song_id = $input['song_id'] ?? 0;

        if ($song_id) {
            // Get file path before deleting from database
            $stmt = $conn->prepare("SELECT filepath FROM songs WHERE id = ?");
            $stmt->bind_param("i", $song_id);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $song = $result->fetch_assoc();
                $filepath = $song['filepath'];

                // Delete from playlist_songs first (foreign key constraint)
                $deletePlaylistSongs = $conn->prepare("DELETE FROM playlist_songs WHERE song_id = ?");
                $deletePlaylistSongs->bind_param("i", $song_id);
                $deletePlaylistSongs->execute();
                $deletePlaylistSongs->close();

                // Delete from songs table
                $deleteSong = $conn->prepare("DELETE FROM songs WHERE id = ?");
                $deleteSong->bind_param("i", $song_id);

                if ($deleteSong->execute()) {
                    // Optional: Delete physical file if it's in uploads directory
                    if (strpos($filepath, 'uploads/') === 0 && file_exists($filepath)) {
                        unlink($filepath);
                    }
                    echo json_encode(['success' => true, 'message' => 'Song deleted successfully']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Database error']);
                }
                $deleteSong->close();
            } else {
                echo json_encode(['success' => false, 'message' => 'Song not found']);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'Song ID required']);
        }
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

$conn->close();
?>