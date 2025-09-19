document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    const songsList = document.getElementById('songs-list');
    const playlistsList = document.getElementById('playlists-list');
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const playlistDetails = document.getElementById('playlist-details');
    const currentPlaylistName = document.getElementById('current-playlist-name');
    const currentPlaylistSongs = document.getElementById('current-playlist-songs');
    const backToPlaylistsBtn = document.getElementById('back-to-playlists');
    const uploadForm = document.getElementById('upload-form');
    const scanDirectoryBtn = document.getElementById('scan-directory');
    const musicDirectoryInput = document.getElementById('music-directory');
    const localFilesList = document.getElementById('local-files-list');

    // New player controls
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress');
    const progressHandle = document.getElementById('progress-handle');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const songSearchInput = document.getElementById('song-search');

    let currentPlayingSong = null;
    let currentSongIndex = -1;
    let currentPlaylist = []; // Currently playing songs list (could be all songs or playlist songs)
    let allSongs = [];
    let filteredSongs = []; // For search functionality
    let allPlaylists = [];

    // --- Fetch and Render Functions ---

    async function fetchSongs() {
        const response = await fetch('api.php?action=get_songs');
        allSongs = await response.json();
        filteredSongs = [...allSongs]; // Initialize filtered songs with all songs
        renderSongs();
    }

    function renderSongs() {
        songsList.innerHTML = '';
        filteredSongs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'song-item';
            songItem.innerHTML = `
                <div class="song-info clickable" onclick="playSongFromList(${index}, window.filteredSongs)">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-actions">
                    <button class="action-btn" onclick="playSongFromList(${index}, window.filteredSongs)" title="Play">
                        <i class="fas fa-play"></i>
                    </button>
                    <div class="playlist-dropdown">
                        <button class="action-btn" onclick="togglePlaylistDropdown(${song.id})" title="Add to Playlist">
                            <i class="fas fa-plus"></i>
                        </button>
                        <div class="dropdown-content" id="dropdown-${song.id}">
                            <!-- Playlists will be populated here -->
                        </div>
                    </div>
                    <button class="action-btn delete-btn" onclick="deleteSong(${song.id})" title="Delete Song">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            songsList.appendChild(songItem);
        });

        // Make allSongs globally accessible for onclick handlers
        window.allSongs = allSongs;
        window.filteredSongs = filteredSongs;
    }

    async function fetchPlaylists() {
        const response = await fetch('api.php?action=get_playlists');
        allPlaylists = await response.json();
        renderPlaylists();
    }

    function renderPlaylists() {
        playlistsList.innerHTML = '';
        allPlaylists.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            playlistItem.innerHTML = `
                <span onclick="showPlaylistDetails({id: ${playlist.id}, name: '${playlist.name}'})" style="cursor: pointer; flex: 1;">${playlist.name}</span>
                <div class="playlist-actions">
                    <button class="action-btn" onclick="renamePlaylist(${playlist.id}, '${playlist.name}')" title="Rename">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="deletePlaylist(${playlist.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            playlistsList.appendChild(playlistItem);
        });
    }

    async function fetchPlaylistSongs(playlistId) {
        const response = await fetch(`api.php?action=get_playlist_songs&playlist_id=${playlistId}`);
        const songs = await response.json();
        renderPlaylistSongs(songs);
    }

    function renderPlaylistSongs(songs) {
        currentPlaylistSongs.innerHTML = '';
        if (songs.length === 0) {
            currentPlaylistSongs.innerHTML = '<div style="text-align: center; color: #718096; padding: 20px;">No songs in this playlist yet.</div>';
            return;
        }
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'song-item clickable';
            songItem.onclick = () => playSongFromList(index, songs);
            songItem.innerHTML = `
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-actions">
                    <i class="fas fa-play"></i>
                </div>
            `;
            currentPlaylistSongs.appendChild(songItem);
        });
    }

    // --- Player Logic ---

    function playSongFromList(index, songList) {
        currentPlaylist = songList;
        currentSongIndex = index;
        playSong(songList[index]);
    }

    function playSong(song) {
        currentPlayingSong = song;
        audioPlayer.src = `serve_file.php?id=${song.id}`;

        audioPlayer.onerror = function() {
            alert('Error playing song: ' + song.title + '. File may not exist or is corrupted.');
        };

        audioPlayer.play().catch(error => {
            console.error('Playback error:', error);
            alert('Cannot play this song. Error: ' + error.message);
        });

        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;

        // Update play button
        updatePlayButton();
    }

    function playNext() {
        if (currentPlaylist.length > 0 && currentSongIndex < currentPlaylist.length - 1) {
            playSongFromList(currentSongIndex + 1, currentPlaylist);
        }
    }

    function playPrevious() {
        if (currentPlaylist.length > 0 && currentSongIndex > 0) {
            playSongFromList(currentSongIndex - 1, currentPlaylist);
        }
    }

    function updatePlayButton() {
        const icon = playPauseBtn.querySelector('i');
        if (audioPlayer.paused) {
            icon.className = 'fas fa-play';
        } else {
            icon.className = 'fas fa-pause';
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function updateProgress() {
        if (audioPlayer.duration) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = progress + '%';
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
            durationEl.textContent = formatTime(audioPlayer.duration);
        }
    }

    // Player event listeners
    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
        updatePlayButton();
    });

    audioPlayer.addEventListener('play', updatePlayButton);
    audioPlayer.addEventListener('pause', updatePlayButton);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateProgress);
    audioPlayer.addEventListener('ended', playNext);

    // Progress bar click handling
    document.querySelector('.progress-bar').addEventListener('click', (e) => {
        if (audioPlayer.duration) {
            const rect = e.target.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = percent * audioPlayer.duration;
        }
    });

    // Previous and Next button functionality
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);

    // Playlist dropdown functionality
    function togglePlaylistDropdown(songId) {
        const dropdown = document.getElementById(`dropdown-${songId}`);

        // Close all other dropdowns
        document.querySelectorAll('.dropdown-content').forEach(d => {
            if (d.id !== `dropdown-${songId}`) {
                d.classList.remove('show');
                d.classList.remove('show-up');
            }
        });

        // Toggle current dropdown
        dropdown.classList.toggle('show');

        // Populate with playlists if opening
        if (dropdown.classList.contains('show')) {
            populatePlaylistDropdown(songId);

            // Position dropdown dynamically
            setTimeout(() => {
                positionDropdown(dropdown);
            }, 10);
        } else {
            dropdown.classList.remove('show-up');
        }
    }

    function positionDropdown(dropdown) {
        const rect = dropdown.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const dropdownHeight = dropdown.offsetHeight;

        // Check if dropdown would go below viewport
        if (rect.bottom > windowHeight - 20) {
            dropdown.classList.add('show-up');
        } else {
            dropdown.classList.remove('show-up');
        }
    }

    function populatePlaylistDropdown(songId) {
        const dropdown = document.getElementById(`dropdown-${songId}`);
        dropdown.innerHTML = '';

        if (allPlaylists.length === 0) {
            dropdown.innerHTML = `
                <div class="dropdown-item disabled">No playlists available</div>
                <div class="dropdown-item" onclick="createNewPlaylist(${songId}); document.getElementById('dropdown-${songId}').classList.remove('show');">
                    <i class="fas fa-plus"></i> Create New Playlist
                </div>
            `;
            return;
        }

        allPlaylists.forEach(playlist => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = playlist.name;
            item.onclick = (e) => {
                e.stopPropagation();
                addSongToPlaylist(songId, playlist.id, playlist.name);
                dropdown.classList.remove('show');
            };
            dropdown.appendChild(item);
        });

        // Add "Create New Playlist" option
        const createItem = document.createElement('div');
        createItem.className = 'dropdown-item create-playlist';
        createItem.innerHTML = '<i class="fas fa-plus"></i> Create New Playlist';
        createItem.onclick = (e) => {
            e.stopPropagation();
            createNewPlaylist(songId);
            dropdown.classList.remove('show');
        };
        dropdown.appendChild(createItem);
    }

    async function createNewPlaylist(songId = null) {
        const playlistName = prompt('Enter new playlist name:');
        if (playlistName && playlistName.trim()) {
            try {
                const response = await fetch('api.php?action=create_playlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: playlistName.trim() })
                });
                const result = await response.json();

                if (result.success) {
                    alert('Playlist created successfully!');
                    await fetchPlaylists(); // Re-fetch to get the new playlist from DB

                    // If a song was selected for adding to this new playlist, add it now
                    if (songId) {
                        await addSongToPlaylist(songId, result.id, playlistName.trim());
                    }

                    // Re-populate all dropdowns to include the new playlist
                    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                        const dropdownId = dropdown.id;
                        const currentSongId = dropdownId.replace('dropdown-', '');
                        if (currentSongId) {
                            populatePlaylistDropdown(currentSongId);
                        }
                    });
                } else {
                    alert('Failed to create playlist: ' + result.message);
                }
            } catch (error) {
                alert('Error creating playlist: ' + error.message);
            }
        }
    }

    async function addSongToPlaylist(songId, playlistId, playlistName) {
        try {
            const response = await fetch('api.php?action=add_song_to_playlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    song_id: songId,
                    playlist_id: playlistId
                })
            });
            const result = await response.json();

            if (result.success) {
                alert(`Song added to "${playlistName}" successfully!`);
            } else {
                alert(`Failed to add song: ${result.message}`);
            }
        } catch (error) {
            alert('Error adding song to playlist: ' + error.message);
        }
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.playlist-dropdown')) {
            document.querySelectorAll('.dropdown-content').forEach(d => {
                d.classList.remove('show');
                d.classList.remove('show-up');
            });
        }
    });

    // Delete song functionality
    async function deleteSong(songId) {
        const songToDelete = allSongs.find(song => song.id == songId);
        if (!songToDelete) {
            alert('Song not found');
            return;
        }

        if (confirm(`Are you sure you want to delete "${songToDelete.title}" by ${songToDelete.artist}?`)) {
            try {
                const response = await fetch('api.php?action=delete_song', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ song_id: songId })
                });
                const result = await response.json();

                if (result.success) {
                    alert('Song deleted successfully!');
                    fetchSongs(); // Refresh song list

                    // If deleted song was currently playing, stop it
                    if (currentPlayingSong && currentPlayingSong.id == songId) {
                        audioPlayer.pause();
                        audioPlayer.src = '';
                        currentSongTitle.textContent = 'No song playing';
                        currentSongArtist.textContent = 'Select a track';
                        currentPlayingSong = null;
                        updatePlayButton();
                    }
                } else {
                    alert('Failed to delete song: ' + result.message);
                }
            } catch (error) {
                alert('Error deleting song: ' + error.message);
            }
        }
    }

    // --- Playlist Management Logic ---

    createPlaylistBtn.addEventListener('click', async () => {
        const playlistName = prompt('Enter new playlist name:');
        if (playlistName && playlistName.trim()) {
            try {
                const response = await fetch('api.php?action=create_playlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: playlistName.trim() })
                });
                const result = await response.json();

                if (result.success) {
                    alert('Playlist created successfully!');
                    fetchPlaylists(); // Re-fetch to get the new playlist from DB
                } else {
                    alert('Failed to create playlist: ' + result.message);
                }
            } catch (error) {
                alert('Error creating playlist: ' + error.message);
            }
        }
    });

    function showPlaylistDetails(playlist) {
        currentPlaylistName.textContent = playlist.name;
        playlistDetails.classList.remove('hidden');
        playlistsList.classList.add('hidden'); // Hide all playlists
        createPlaylistBtn.classList.add('hidden');

        fetchPlaylistSongs(playlist.id);
    }

    backToPlaylistsBtn.addEventListener('click', () => {
        playlistDetails.classList.add('hidden');
        playlistsList.classList.remove('hidden');
        createPlaylistBtn.classList.remove('hidden');
    });

    // Upload functionality
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('music-file');
        const titleInput = document.getElementById('song-title');
        const artistInput = document.getElementById('song-artist');
        const albumInput = document.getElementById('song-album');

        // Validation
        if (!fileInput.files[0]) {
            alert('Please select a music file');
            return;
        }
        if (!titleInput.value.trim()) {
            alert('Please enter a song title');
            return;
        }
        if (!artistInput.value.trim()) {
            alert('Please enter an artist name');
            return;
        }

        const formData = new FormData();
        formData.append('music_file', fileInput.files[0]);
        formData.append('title', titleInput.value.trim());
        formData.append('artist', artistInput.value.trim());
        formData.append('album', albumInput.value.trim());

        try {
            const response = await fetch('upload_simple.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                alert('Song uploaded successfully!');
                uploadForm.reset();
                fetchSongs(); // Refresh song list
            } else {
                alert('Upload failed: ' + result.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload error: ' + error.message);
        }
    });

    // Search functionality
    function filterSongs(searchTerm) {
        if (!searchTerm.trim()) {
            filteredSongs = [...allSongs];
        } else {
            const term = searchTerm.toLowerCase();
            filteredSongs = allSongs.filter(song =>
                song.title.toLowerCase().includes(term) ||
                song.artist.toLowerCase().includes(term) ||
                (song.album && song.album.toLowerCase().includes(term))
            );
        }
        window.filteredSongs = filteredSongs;
        renderSongs();
    }

    songSearchInput.addEventListener('input', (e) => {
        filterSongs(e.target.value);
    });

    // Playlist management functions
    async function deletePlaylist(playlistId) {
        if (confirm('Are you sure you want to delete this playlist?')) {
            try {
                const response = await fetch('api.php?action=delete_playlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playlist_id: playlistId })
                });
                const result = await response.json();
                if (result.success) {
                    fetchPlaylists(); // Refresh playlist list
                } else {
                    alert('Delete failed: ' + result.message);
                }
            } catch (error) {
                alert('Delete error: ' + error.message);
            }
        }
    }

    async function renamePlaylist(playlistId, currentName) {
        const newName = prompt('Enter new playlist name:', currentName);
        if (newName && newName !== currentName) {
            try {
                const response = await fetch('api.php?action=rename_playlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playlist_id: playlistId, new_name: newName })
                });
                const result = await response.json();
                if (result.success) {
                    fetchPlaylists(); // Refresh playlist list
                } else {
                    alert('Rename failed: ' + result.message);
                }
            } catch (error) {
                alert('Rename error: ' + error.message);
            }
        }
    }

    // Local file scanning functionality
    scanDirectoryBtn.addEventListener('click', async () => {
        const directory = musicDirectoryInput.value.trim();
        if (!directory) {
            alert('Please enter a directory path');
            return;
        }

        try {
            const response = await fetch('local_scanner.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'scan_directory', directory: directory })
            });
            const result = await response.json();

            if (result.success) {
                renderLocalFiles(result.files);
            } else {
                alert('Scan failed: ' + result.message);
            }
        } catch (error) {
            alert('Scan error: ' + error.message);
        }
    });

    function renderLocalFiles(files) {
        if (files.length === 0) {
            localFilesList.innerHTML = '<p>No audio files found in this directory.</p>';
            return;
        }

        localFilesList.innerHTML = '<h4>Found ' + files.length + ' audio files:</h4>';

        files.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'local-file-item';
            fileDiv.innerHTML = `
                <div class="file-info">
                    <strong>${file.filename}</strong>
                    <span class="file-size">(${formatFileSize(file.size)})</span>
                </div>
                <div class="file-metadata">
                    <input type="text" class="file-title" placeholder="Title" value="${file.suggested_title}">
                    <input type="text" class="file-artist" placeholder="Artist" value="${file.suggested_artist}">
                    <input type="text" class="file-album" placeholder="Album" value="${file.suggested_album || ''}">
                    <span class="file-info-extra">${formatDuration(file.duration)} | ${file.format.toUpperCase()}</span>
                    <button onclick="addLocalFile('${file.filepath}', this, ${file.duration})">Add to Library</button>
                </div>
            `;
            localFilesList.appendChild(fileDiv);
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    async function addLocalFile(filepath, buttonElement, duration = 0) {
        const fileItem = buttonElement.closest('.local-file-item');
        const title = fileItem.querySelector('.file-title').value.trim();
        const artist = fileItem.querySelector('.file-artist').value.trim();
        const album = fileItem.querySelector('.file-album').value.trim();

        if (!title || !artist) {
            alert('Please enter title and artist');
            return;
        }

        try {
            const response = await fetch('local_scanner.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_local_file',
                    filepath: filepath,
                    title: title,
                    artist: artist,
                    album: album,
                    duration: duration
                })
            });
            const result = await response.json();

            if (result.success) {
                buttonElement.textContent = 'Added!';
                buttonElement.disabled = true;
                buttonElement.style.backgroundColor = '#28a745';
                fetchSongs(); // Refresh song list
            } else {
                alert('Add failed: ' + result.message);
            }
        } catch (error) {
            alert('Add error: ' + error.message);
        }
    }

    // Make functions global for onclick handlers
    window.playSong = playSong;
    window.playSongFromList = playSongFromList;
    window.showPlaylistDetails = showPlaylistDetails;
    window.deletePlaylist = deletePlaylist;
    window.renamePlaylist = renamePlaylist;
    window.addLocalFile = addLocalFile;
    window.togglePlaylistDropdown = togglePlaylistDropdown;
    window.addSongToPlaylist = addSongToPlaylist;
    window.deleteSong = deleteSong;
    window.createNewPlaylist = createNewPlaylist;

    // Card minimize/maximize functionality
    function toggleCard(button) {
        const card = button.closest('.card');
        const icon = button.querySelector('i');

        card.classList.toggle('minimized');

        if (card.classList.contains('minimized')) {
            icon.className = 'fas fa-plus';
        } else {
            icon.className = 'fas fa-minus';
        }
    }

    window.toggleCard = toggleCard;

    // Initial loads
    fetchSongs();
    fetchPlaylists();
});