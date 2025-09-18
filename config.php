<?php
// Music Player Configuration

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'music_user');
define('DB_PASSWORD', 'music_pass');
define('DB_NAME', 'music_player');

// File Upload Configuration
define('MAX_FILE_SIZE', 52428800); // 50MB
define('UPLOAD_DIR', 'uploads/');
define('ALLOWED_AUDIO_TYPES', ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac']);

// Local Music Configuration
define('DEFAULT_MUSIC_DIR', '/home/shrek/Music');
define('SUPPORTED_EXTENSIONS', ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac']);

// Server Configuration
define('BASE_URL', 'http://localhost:8000');

// Debug Configuration
define('DEBUG_MODE', true);
define('LOG_ERRORS', true);
?>