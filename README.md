# Music Player Project

A modern web-based music player with playlist management, local file scanning, and database storage.

## Project Structure

```
MusicPlayer-Project/
├── index.html              # Main HTML file
├── style.css               # CSS styles with modern glassmorphism design
├── script.js               # JavaScript functionality
├── api.php                 # REST API endpoints
├── db_connect.php          # Database connection
├── upload_simple.php       # File upload handler
├── local_scanner.php       # Local file scanner
├── serve_file.php          # Audio file server
├── database/               # Database files
│   └── ai_studio_code.sql  # Database schema
├── uploads/                # Uploaded music files
├── config.php              # Configuration
├── .env.example            # Environment template
└── README.md               # This file
```

**✅ XAMPP Ready!** - Just copy this folder to `C:\xampp\htdocs\` and it works!

## Features

- **Music Playback**: Play, pause, next, previous functionality
- **Playlist Management**: Create, delete, rename playlists
- **File Upload**: Upload music files with metadata
- **Local File Scanner**: Scan local directories for music files
- **Search**: Search through music library
- **Modern UI**: Glassmorphism design with smooth animations
- **Minimizable Cards**: Collapse sections to manage workspace
- **Audio Controls**: Progress bar, time display, volume control

## Database Setup

1. Install MariaDB/MySQL
2. Create database and user:
   ```sql
   CREATE DATABASE music_player;
   CREATE USER 'music_user'@'localhost' IDENTIFIED BY 'music_pass';
   GRANT ALL PRIVILEGES ON music_player.* TO 'music_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Import the schema:
   ```bash
   mysql -u music_user -p music_player < database/ai_studio_code.sql
   ```

## Configuration

- Database credentials are in `backend/db_connect.php`
- PHP upload limits may need to be adjusted in `php.ini`:
  - `upload_max_filesize = 50M`
  - `post_max_size = 60M`
  - `memory_limit = 256M`
  - `max_execution_time = 300`

## 🚀 Easy XAMPP Setup

### 1. Install XAMPP
- Download from [https://www.apachefriends.org/](https://www.apachefriends.org/)
- Install it

### 2. Copy Project
- Copy this entire `MusicPlayer-Project` folder to `C:\xampp\htdocs\`

### 3. Start Services
- Open XAMPP Control Panel
- Start **Apache** and **MySQL**

### 4. Setup Database
- Go to `http://localhost/phpmyadmin/`
- Click **SQL** tab and run:
```sql
CREATE DATABASE music_player;
CREATE USER 'music_user'@'localhost' IDENTIFIED BY 'music_pass';
GRANT ALL PRIVILEGES ON music_player.* TO 'music_user'@'localhost';
FLUSH PRIVILEGES;
```
- Click on `music_player` database → **Import** → Choose `database/ai_studio_code.sql`

### 5. Access Your Music Player
- Open browser: `http://localhost/MusicPlayer-Project/`

**That's it! No symlinks, no scripts, just works! 🎉**

---

### Alternative: Linux/Mac with PHP
```bash
php -S localhost:8000
```
Then go to `http://localhost:8000`

## API Endpoints

- `GET /api.php?action=get_songs` - Get all songs
- `GET /api.php?action=get_playlists` - Get all playlists
- `GET /api.php?action=get_playlist_songs&playlist_id=X` - Get playlist songs
- `POST /api.php?action=create_playlist` - Create playlist
- `POST /api.php?action=delete_playlist` - Delete playlist
- `POST /api.php?action=rename_playlist` - Rename playlist
- `POST /api.php?action=add_song_to_playlist` - Add song to playlist
- `POST /api.php?action=delete_song` - Delete song

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 8+, MySQLi
- **Database**: MariaDB/MySQL
- **Audio**: HTML5 Audio API
- **Styling**: FontAwesome icons, Custom CSS with gradients

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## License

This project is for educational/personal use.