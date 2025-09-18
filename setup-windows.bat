@echo off
echo 🎵 Music Player Project - Windows Setup
echo ========================================

echo Creating symbolic links for web access...
echo (Run this as Administrator)

:: Create symbolic links (Windows equivalent of symlinks)
mklink api.php backend\api.php
mklink db_connect.php backend\db_connect.php
mklink upload_simple.php backend\upload_simple.php
mklink local_scanner.php backend\local_scanner.php
mklink serve_file.php backend\serve_file.php
mklink index.html frontend\index.html
mklink style.css frontend\style.css
mklink script.js frontend\script.js

echo.
echo ✅ Symbolic links created
echo.
echo 📋 Next steps:
echo 1. Make sure XAMPP/WAMP is running (Apache + MySQL)
echo 2. Import database\ai_studio_code.sql into phpMyAdmin
echo 3. Access: http://localhost/MusicPlayer-Project/
echo.
echo 🗄️  Database setup commands for phpMyAdmin:
echo CREATE DATABASE music_player;
echo CREATE USER 'music_user'@'localhost' IDENTIFIED BY 'music_pass';
echo GRANT ALL PRIVILEGES ON music_player.* TO 'music_user'@'localhost';
echo FLUSH PRIVILEGES;

pause