# Windows Setup Guide

## Option 1: XAMPP (Recommended - Easiest)

### 1. Download and Install XAMPP
- Go to [https://www.apachefriends.org/download.html](https://www.apachefriends.org/download.html)
- Download XAMPP for Windows
- Install it (default location: `C:\xampp\`)

### 2. Copy Project Files
- Copy the entire `MusicPlayer-Project` folder to `C:\xampp\htdocs\`
- Your project should be at: `C:\xampp\htdocs\MusicPlayer-Project\`

### 3. Start Services
- Open XAMPP Control Panel
- Start **Apache** and **MySQL** services

### 4. Setup Database
- Open browser: `http://localhost/phpmyadmin/`
- Click "SQL" tab
- Run these commands:
```sql
CREATE DATABASE music_player;
CREATE USER 'music_user'@'localhost' IDENTIFIED BY 'music_pass';
GRANT ALL PRIVILEGES ON music_player.* TO 'music_user'@'localhost';
FLUSH PRIVILEGES;
```
- Click on `music_player` database
- Click "Import" tab
- Choose file: `database/ai_studio_code.sql`
- Click "Go"

### 5. Create Symlinks (Windows)
Open Command Prompt **as Administrator** in your project folder:
```cmd
cd C:\xampp\htdocs\MusicPlayer-Project
mklink api.php backend\api.php
mklink db_connect.php backend\db_connect.php
mklink upload_simple.php backend\upload_simple.php
mklink local_scanner.php backend\local_scanner.php
mklink serve_file.php backend\serve_file.php
mklink index.html frontend\index.html
mklink style.css frontend\style.css
mklink script.js frontend\script.js
```

### 6. Access Application
- Open browser: `http://localhost/MusicPlayer-Project/`

---

## Option 2: WAMP (Alternative)

### 1. Download WAMP
- Go to [http://www.wampserver.com/](http://www.wampserver.com/)
- Download and install WampServer

### 2. Follow Similar Steps
- Copy project to `C:\wamp64\www\MusicPlayer-Project\`
- Start WampServer
- Access phpMyAdmin at `http://localhost/phpmyadmin/`
- Follow same database setup as XAMPP
- Create symlinks as shown above
- Access at `http://localhost/MusicPlayer-Project/`

---

## Option 3: Laravel Valet (Advanced)

If you're familiar with PHP development:
- Install PHP, Composer, and Laravel Valet
- Use Valet to serve the project

---

## Option 4: Docker (Advanced)

### 1. Create docker-compose.yml
```yaml
version: '3.8'
services:
  web:
    image: php:8.1-apache
    ports:
      - "8000:80"
    volumes:
      - .:/var/www/html
    depends_on:
      - db

  db:
    image: mariadb:10.6
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: music_player
      MYSQL_USER: music_user
      MYSQL_PASSWORD: music_pass
    ports:
      - "3306:3306"
```

### 2. Run
```bash
docker-compose up -d
```

---

## Troubleshooting

### PHP Extensions
Make sure these are enabled in `php.ini`:
- `extension=mysqli`
- `extension=fileinfo`
- `extension=mbstring`

### File Permissions
Windows usually doesn't have permission issues, but make sure:
- The `uploads` folder exists and is writable
- PHP can read/write to the project directory

### Common Issues
1. **"mysqli not found"**: Enable mysqli extension in XAMPP/WAMP
2. **"Permission denied"**: Run Command Prompt as Administrator for symlinks
3. **"Database connection failed"**: Check MySQL is running in XAMPP/WAMP
4. **Files not uploading**: Check PHP upload limits in `php.ini`

### Default Music Directory
Change line 74 in `frontend/index.html`:
```html
<input type="text" id="music-directory" placeholder="C:\Users\YourName\Music" value="C:\Users\YourName\Music">
```

---

## Recommended: XAMPP Setup
For beginners, XAMPP is the easiest option. It includes everything you need:
- Apache web server
- PHP 8+
- MySQL/MariaDB
- phpMyAdmin for database management

After setup, your music player will be available at:
`http://localhost/MusicPlayer-Project/`