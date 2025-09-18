#!/bin/bash
# Music Player Project Setup Script

echo "🎵 Music Player Project Setup"
echo "=============================="

# Optional: Create symlinks for development (uncomment if needed)
# echo "Creating symlinks..."
# ln -sf backend/api.php api.php
# ln -sf backend/db_connect.php db_connect.php
# ln -sf backend/upload_simple.php upload_simple.php
# ln -sf backend/local_scanner.php local_scanner.php
# ln -sf backend/serve_file.php serve_file.php
# ln -sf frontend/index.html index.html
# ln -sf frontend/style.css style.css
# ln -sf frontend/script.js script.js
# echo "✅ Symlinks created"

# Set up uploads directory with proper permissions
mkdir -p uploads
chmod 755 uploads
echo "✅ Uploads directory configured"

# Check if database exists
echo "Checking database setup..."
if command -v mariadb &> /dev/null; then
    DB_CMD="mariadb"
elif command -v mysql &> /dev/null; then
    DB_CMD="mysql"
else
    echo "❌ Neither MariaDB nor MySQL found. Please install one."
    exit 1
fi

# Test database connection
if $DB_CMD -u music_user -pmusic_pass -e "USE music_player; SELECT 1;" &> /dev/null; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database not configured. Please run the following commands:"
    echo ""
    echo "sudo $DB_CMD -u root -p"
    echo "CREATE DATABASE music_player;"
    echo "CREATE USER 'music_user'@'localhost' IDENTIFIED BY 'music_pass';"
    echo "GRANT ALL PRIVILEGES ON music_player.* TO 'music_user'@'localhost';"
    echo "FLUSH PRIVILEGES;"
    echo "EXIT;"
    echo ""
    echo "Then import the schema:"
    echo "$DB_CMD -u music_user -pmusic_pass music_player < database/ai_studio_code.sql"
fi

# Check PHP requirements
echo "Checking PHP configuration..."
PHP_VERSION=$(php -v | head -n 1 | cut -d ' ' -f 2 | cut -d '.' -f 1,2)
echo "PHP Version: $PHP_VERSION"

if php -m | grep -q mysqli; then
    echo "✅ MySQLi extension found"
else
    echo "❌ MySQLi extension not found. Please install php-mysqli"
fi

echo ""
echo "🚀 Setup complete! To start the server:"
echo "   php -S localhost:8000"
echo ""
echo "Then open: http://localhost:8000"