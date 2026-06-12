// Typing Speed Test - Clean JavaScript

// Game Data
const quotes = [
    "The quick brown fox jumps over the lazy dog.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Innovation distinguishes between a leader and a follower.",
    "Life is what happens when you're busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It is during our darkest moments that we must focus to see the light.",
    "Whoever is happy will make others happy too.",
    "You will face many defeats in life, but never let yourself be defeated.",
    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "In the middle of every difficulty lies opportunity.",
    "The only impossible journey is the one you never begin.",
    "Don't watch the clock; do what it does. Keep going.",
    "Believe you can and you're halfway there.",
    "It does not matter how slowly you go as long as you do not stop."
];

// State
let currentQuote = '';
let startTime = null;
let timerInterval = null;
let isTestActive = false;
let currentMode = 'solo';
let currentRoomCode = null;
let isRoomHost = false;
let playerId = null;
let opponentJoined = false;
let raceFinished = false;
let characterErrors = 0;
let totalCharacters = 0;

// Statistics
const STATS_KEY = 'typing_stats';
const SESSION_HISTORY_KEY = 'typing_session_history';
const MAX_HISTORY_ITEMS = 50;

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const inputArea = document.getElementById('inputArea');
const startBtn = document.getElementById('startBtn');
const results = document.getElementById('results');
const roomSection = document.getElementById('roomSection');
const playerStatus = document.getElementById('playerStatus');
const soloStats = document.getElementById('soloStats');
const waitingMessage = document.getElementById('waitingMessage');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    
    // Check for room code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    if (roomCode) {
        setMode('multiplayer');
        document.getElementById('joinRoomInput').value = roomCode.toUpperCase();
        joinRoom();
    }
    
    // Start sync loop
    setInterval(syncLoop, 500);
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Setup offline indicator
    setupOfflineIndicator();
    
    // Track stats
    trackUsageStats();
    
    // Load and display statistics
    loadAndDisplayStats();
}

// Statistics Functions
function getStats() {
    const stats = localStorage.getItem(STATS_KEY);
    return stats ? JSON.parse(stats) : {
        bestWpm: 0,
        bestAccuracy: 0,
        totalTests: 0,
        totalTimeMinutes: 0,
        totalCharactersTyped: 0,
        averageWpm: 0,
        testsCompleted: 0,
        testsAbandoned: 0
    };
}

function saveStats(stats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function getSessionHistory() {
    const history = localStorage.getItem(SESSION_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
}

function addSessionToHistory(session) {
    const history = getSessionHistory();
    history.unshift(session);
    if (history.length > MAX_HISTORY_ITEMS) {
        history.pop();
    }
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history));
}

function updateStatsAfterTest(wpm, accuracy, characters, errors, timeSeconds, completed) {
    const stats = getStats();
    
    if (completed) {
        stats.totalTests++;
        stats.testsCompleted++;
        stats.totalTimeMinutes += timeSeconds / 60;
        stats.totalCharactersTyped += characters;
        
        // Update best scores
        if (wpm > stats.bestWpm) {
            stats.bestWpm = wpm;
            showToast(`🎉 New Best WPM: ${wpm}!`, 3000);
        }
        if (accuracy > stats.bestAccuracy) {
            stats.bestAccuracy = accuracy;
        }
        
        // Recalculate average
        const totalWpmSum = getSessionHistory().reduce((sum, s) => sum + s.wpm, 0) + wpm;
        stats.averageWpm = Math.round(totalWpmSum / (stats.testsCompleted || 1));
        
        // Add to history
        addSessionToHistory({
            wpm,
            accuracy,
            characters,
            errors,
            timeSeconds,
            date: new Date().toISOString(),
            mode: currentMode
        });
    } else {
        stats.testsAbandoned++;
    }
    
    saveStats(stats);
    loadAndDisplayStats();
    
    return stats;
}

function loadAndDisplayStats() {
    const stats = getStats();
    const statsContainer = document.getElementById('personalStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="personal-stat-card">
                <div class="personal-stat-value">${stats.bestWpm}</div>
                <div class="personal-stat-label">Best WPM</div>
            </div>
            <div class="personal-stat-card">
                <div class="personal-stat-value">${stats.bestAccuracy}%</div>
                <div class="personal-stat-label">Best Accuracy</div>
            </div>
            <div class="personal-stat-card">
                <div class="personal-stat-value">${stats.averageWpm}</div>
                <div class="personal-stat-label">Avg WPM</div>
            </div>
            <div class="personal-stat-card">
                <div class="personal-stat-value">${stats.totalTests}</div>
                <div class="personal-stat-label">Tests Taken</div>
            </div>
        `;
    }
    
    // Update history table
    updateHistoryTable();
}

function updateHistoryTable() {
    const historyTable = document.getElementById('historyTableBody');
    if (historyTable) {
        const history = getSessionHistory().slice(0, 10);
        if (history.length === 0) {
            historyTable.innerHTML = '<tr><td colspan="6" class="no-history">No completed tests yet. Take a test to see your history!</td></tr>';
        } else {
            historyTable.innerHTML = history.map(session => {
                const date = new Date(session.date);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `
                    <tr>
                        <td>${dateStr} ${timeStr}</td>
                        <td class="wpm-cell">${session.wpm}</td>
                        <td class="accuracy-cell">${session.accuracy}%</td>
                        <td>${session.characters}</td>
                        <td>${session.errors}</td>
                        <td><span class="mode-badge ${session.mode}">${session.mode}</span></td>
                    </tr>
                `;
            }).join('');
        }
    }
}

function toggleHistoryModal() {
    const modal = document.getElementById('historyModal');
    modal.classList.toggle('show');
    if (modal.classList.contains('show')) {
        updateHistoryTable();
    }
}

function clearAllStats() {
    if (confirm('Are you sure you want to clear all your statistics and history? This cannot be undone.')) {
        localStorage.removeItem(STATS_KEY);
        localStorage.removeItem(SESSION_HISTORY_KEY);
        loadAndDisplayStats();
        showToast('Statistics cleared!', 2000);
    }
}

// Mode Selection
function setMode(mode) {
    currentMode = mode;
    document.getElementById('soloBtn').classList.toggle('active', mode === 'solo');
    document.getElementById('multiplayerBtn').classList.toggle('active', mode === 'multiplayer');
    
    if (mode === 'multiplayer') {
        roomSection.classList.add('show');
        soloStats.style.display = 'none';
    } else {
        roomSection.classList.remove('show');
        playerStatus.classList.remove('show');
        soloStats.style.display = 'grid';
        waitingMessage.classList.remove('show');
        leaveRoomBtn.style.display = 'none';
        leaveRoom();
    }
}

// Toggle Room View
function toggleRoomView() {
    const createView = document.getElementById('createRoomView');
    const joinView = document.getElementById('joinRoomView');
    const switchText = document.getElementById('switchText');
    
    if (createView.style.display === 'none') {
        createView.style.display = 'block';
        joinView.style.display = 'none';
        switchText.textContent = 'Join';
    } else {
        createView.style.display = 'none';
        joinView.style.display = 'block';
        switchText.textContent = 'Create';
    }
}

// Generate Room Code
function generateRoomCode() {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    document.getElementById('roomCodeDisplay').textContent = code;
    currentRoomCode = code;
    isRoomHost = true;
    
    // Initialize room data
    const roomData = {
        host: playerId,
        quote: quotes[Math.floor(Math.random() * quotes.length)],
        hostProgress: 0,
        hostWpm: 0,
        hostAccuracy: 0,
        hostFinished: false,
        guest: null,
        guestProgress: 0,
        guestWpm: 0,
        guestAccuracy: 0,
        guestFinished: false,
        raceStarted: false,
        raceEnded: false,
        created: Date.now()
    };
    localStorage.setItem('typing_room_' + code, JSON.stringify(roomData));
    
    // Show player status
    playerStatus.classList.add('show');
    waitingMessage.classList.add('show');
    leaveRoomBtn.style.display = 'inline-block';
    
    // Update URL
    window.history.replaceState({}, '', '?room=' + code);
    
    showToast('Room created! Share the code with a friend.');
}

// Copy Room Code
function copyRoomCode() {
    const code = document.getElementById('roomCodeDisplay').textContent;
    if (code === '----') return;
    
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = '📋 Copy Code';
            btn.classList.remove('copied');
        }, 2000);
    });
}

// Join Room
function joinRoom() {
    const code = document.getElementById('joinRoomInput').value.toUpperCase();
    if (code.length !== 4) {
        showToast('Please enter a valid 4-character room code');
        return;
    }
    
    const roomData = JSON.parse(localStorage.getItem('typing_room_' + code));
    if (!roomData) {
        showToast('Room not found. Please check the code and try again.');
        return;
    }
    
    // Join as guest
    roomData.guest = playerId;
    localStorage.setItem('typing_room_' + code, JSON.stringify(roomData));
    
    currentRoomCode = code;
    isRoomHost = false;
    opponentJoined = true;
    
    // Show player status
    playerStatus.classList.add('show');
    roomSection.classList.remove('show');
    leaveRoomBtn.style.display = 'inline-block';
    
    // Update URL
    window.history.replaceState({}, '', '?room=' + code);
    
    // Load the quote
    currentQuote = roomData.quote;
    quoteDisplay.innerHTML = currentQuote.split('').map(char => 
        `<span class="char">${char}</span>`
    ).join('');
    
    showToast('Joined room! Waiting for host to start...');
}

// Leave Room
function leaveRoom() {
    if (currentRoomCode) {
        const roomData = JSON.parse(localStorage.getItem('typing_room_' + currentRoomCode));
        if (roomData) {
            if (isRoomHost) {
                localStorage.removeItem('typing_room_' + currentRoomCode);
            } else {
                roomData.guest = null;
                roomData.guestProgress = 0;
                roomData.guestWpm = 0;
                roomData.guestAccuracy = 0;
                localStorage.setItem('typing_room_' + currentRoomCode, JSON.stringify(roomData));
            }
        }
    }
    
    currentRoomCode = null;
    isRoomHost = false;
    opponentJoined = false;
    raceFinished = false;
    
    playerStatus.classList.remove('show');
    waitingMessage.classList.remove('show');
    leaveRoomBtn.style.display = 'none';
    
    window.history.replaceState({}, '', window.location.pathname);
    resetTest();
}

// Sync Loop
function syncLoop() {
    if (!currentRoomCode) return;
    
    const roomData = JSON.parse(localStorage.getItem('typing_room_' + currentRoomCode));
    if (!roomData) {
        showToast('The room has been closed by the host.');
        leaveRoom();
        return;
    }
    
    // Check if opponent joined
    if (isRoomHost && roomData.guest && !opponentJoined) {
        opponentJoined = true;
        waitingMessage.classList.remove('show');
        showToast('Opponent joined! Ready to race!');
    }
    
    // Update opponent stats
    if (isRoomHost) {
        document.getElementById('opponentWpm').textContent = roomData.guestWpm || 0;
        document.getElementById('opponentAccuracy').textContent = (roomData.guestAccuracy || 0) + '%';
        document.getElementById('opponentProgress').style.width = (roomData.guestProgress || 0) + '%';
        document.getElementById('opponentProgressText').textContent = Math.round(roomData.guestProgress || 0) + '% complete';
        
        if (roomData.guestFinished && !raceFinished) {
            checkRaceEnd();
        }
    } else {
        document.getElementById('opponentWpm').textContent = roomData.hostWpm || 0;
        document.getElementById('opponentAccuracy').textContent = (roomData.hostAccuracy || 0) + '%';
        document.getElementById('opponentProgress').style.width = (roomData.hostProgress || 0) + '%';
        document.getElementById('opponentProgressText').textContent = Math.round(roomData.hostProgress || 0) + '% complete';
        
        // Sync quote from host
        if (currentQuote !== roomData.quote) {
            currentQuote = roomData.quote;
            quoteDisplay.innerHTML = currentQuote.split('').map(char => 
                `<span class="char">${char}</span>`
            ).join('');
        }
        
        if (roomData.hostFinished && !raceFinished) {
            checkRaceEnd();
        }
    }
}

// Start Test
function startTest() {
    if (currentMode === 'multiplayer') {
        if (!currentRoomCode) {
            showToast('Create or join a room first!');
            return;
        }
        if (isRoomHost && !opponentJoined) {
            showToast('Waiting for opponent to join...');
            return;
        }
    }
    
    // Get quote
    if (currentMode === 'multiplayer') {
        const roomData = JSON.parse(localStorage.getItem('typing_room_' + currentRoomCode));
        currentQuote = roomData.quote;
    } else {
        currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }
    
    // Reset state
    characterErrors = 0;
    totalCharacters = 0;
    
    // Display quote
    quoteDisplay.innerHTML = currentQuote.split('').map(char => 
        `<span class="char">${char}</span>`
    ).join('');
    
    // Enable input
    inputArea.value = '';
    inputArea.disabled = false;
    inputArea.focus();
    
    // Update button
    startBtn.textContent = '⏱️ Racing...';
    startBtn.disabled = true;
    
    // Start timer
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
    isTestActive = true;
    
    // Hide results
    results.classList.remove('show');
}

// Input Handler
inputArea.addEventListener('input', () => {
    if (!isTestActive) return;
    
    const input = inputArea.value;
    const quoteChars = quoteDisplay.querySelectorAll('.char');
    
    // Update display
    let correctCount = 0;
    characterErrors = 0;
    
    quoteChars.forEach((charSpan, index) => {
        const char = input[index];
        if (char == null) {
            charSpan.classList.remove('correct', 'incorrect');
        } else if (char === currentQuote[index]) {
            charSpan.classList.add('correct');
            charSpan.classList.remove('incorrect');
            correctCount++;
        } else {
            charSpan.classList.remove('correct');
            charSpan.classList.add('incorrect');
            characterErrors++;
        }
    });
    
    totalCharacters = input.length;
    
    // Update stats
    updateStats(correctCount, characterErrors);
    
    // Sync multiplayer progress
    if (currentMode === 'multiplayer' && currentRoomCode) {
        const roomData = JSON.parse(localStorage.getItem('typing_room_' + currentRoomCode));
        const progress = (correctCount / currentQuote.length) * 100;
        const timeElapsed = (Date.now() - startTime) / 1000 / 60;
        const wpm = timeElapsed > 0 ? Math.round((correctCount / 5) / timeElapsed) : 0;
        const accuracy = totalCharacters > 0 ? Math.round(((totalCharacters - characterErrors) / totalCharacters) * 100) : 100;
        
        if (isRoomHost) {
            roomData.hostProgress = progress;
            roomData.hostWpm = wpm;
            roomData.hostAccuracy = accuracy;
        } else {
            roomData.guestProgress = progress;
            roomData.guestWpm = wpm;
            roomData.guestAccuracy = accuracy;
        }
        
        localStorage.setItem('typing_room_' + currentRoomCode, JSON.stringify(roomData));
    }
    
    // Check if complete
    if (correctCount === currentQuote.length) {
        endTest(true);
    }
});

// Update Timer
function updateTimer() {
    if (!isTestActive) return;
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('time').textContent = elapsed + 's';
    
    // Update your stats in multiplayer
    if (currentMode === 'multiplayer' && currentRoomCode) {
        const roomData = JSON.parse(localStorage.getItem('typing_room_' + currentRoomCode));
        const timeElapsed = elapsed / 60;
        const wpm = timeElapsed > 0 ? Math.round((totalCharacters / 5) / timeElapsed) : 0;
        const accuracy = totalCharacters > 0 ? Math.round(((totalCharacters - characterErrors) / totalCharacters) * 100) : 100;
        
        document.getElementById('yourWpm').textContent = wpm;
        document.getElementById('yourAccuracy').textContent = accuracy + '%';
        
        const progress = (totalCharacters / currentQuote.length) * 100;
        document.getElementById('yourProgress').style.width = progress + '%';
        document.getElementById('yourProgressText').textContent = Math.round(progress) + '% complete';
    }
}

// Update Stats
function updateStats(correct, errors) {
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wpm = timeElapsed > 0 ? Math.round((correct / 5) / timeElapsed) : 0;
    const accuracy = totalCharacters > 0 ? Math.round(((totalCharacters - errors) / totalCharacters) * 100) : 100;
    
    document.getElementById('wpm').textContent = wpm;
    document.getElementById('accuracy').textContent = accuracy + '%';
}

// End Test
function endTest(completed) {
    clearInterval(timerInterval);
    isTestActive = false;
    
    inputArea.disabled = true;
    startBtn.textContent = '▶️ Start Test';
    startBtn.disabled = false;
    
    // Calculate final stats
    const timeElapsed = (Date.now() - startTime) / 1000;
    const timeMinutes = timeElapsed / 60;
    const correctChars = totalCharacters - characterErrors;
    const wpm = timeMinutes > 0 ? Math.round((correctChars / 5) / timeMinutes) : 0;
    const accuracy = totalCharacters > 0 ? Math.round((correctChars / totalCharacters) * 100) : 100;
    
    // Update and save statistics
    const stats = updateStatsAfterTest(wpm, accuracy, totalCharacters, characterErrors, timeElapsed, completed);
    
    // Show results
    document.getElementById('finalWpm').textContent = wpm;
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    document.getElementById('finalChars').textContent = totalCharacters;
    document.getElementById('finalErrors').textContent = characterErrors;
    
    // Show personal best in results
    const personalBestEl = document.getElementById('personalBestResult');
    if (personalBestEl && completed) {
        if (wpm >= stats.bestWpm) {
            personalBestEl.innerHTML = '🏆 New Personal Best!';
            personalBestEl.classList.add('new-record');
        } else {
            personalBestEl.innerHTML = `Personal Best: ${stats.bestWpm} WPM`;
            personalBestEl.classList.remove('new-record');
        }
        personalBestEl.style.display = 'block';
    }
    
    results.classList.add('show');
    
    // Multiplayer end
    if (currentMode === 'multiplayer' && currentRoomCode) {
        const roomData = JSON.parse(localStorage.getItem('typing_room_' + currentRoomCode));
        
        if (isRoomHost) {
            roomData.hostFinished = true;
            roomData.hostWpm = wpm;
            roomData.hostAccuracy = accuracy;
        } else {
            roomData.guestFinished = true;
            roomData.guestWpm = wpm;
            roomData.guestAccuracy = accuracy;
        }
        
        localStorage.setItem('typing_room_' + currentRoomCode, JSON.stringify(roomData));
        checkRaceEnd();
    }
}

// Check Race End
function checkRaceEnd() {
    const roomData = JSON.parse(localStorage.getItem('typing_room_' + currentRoomCode));
    if (!roomData || raceFinished) return;
    
    if (roomData.hostFinished && roomData.guestFinished) {
        raceFinished = true;
        
        const hostScore = roomData.hostWpm * (roomData.hostAccuracy / 100);
        const guestScore = roomData.guestWpm * (roomData.guestAccuracy / 100);
        
        const hostWon = hostScore >= guestScore;
        const youWon = isRoomHost ? hostWon : !hostWon;
        
        const yourCard = document.getElementById('playerCardYou');
        const opponentCard = document.getElementById('playerCardOpponent');
        
        if (youWon) {
            yourCard.classList.add('winner');
            document.getElementById('winnerText').textContent = '🏆 You Win!';
            document.getElementById('winnerSubtext').textContent = 'Amazing typing skills!';
            document.getElementById('winnerWpm').textContent = isRoomHost ? roomData.hostWpm : roomData.guestWpm;
            document.getElementById('winnerAccuracy').textContent = (isRoomHost ? roomData.hostAccuracy : roomData.guestAccuracy) + '%';
        } else {
            opponentCard.classList.add('winner');
            document.getElementById('winnerText').textContent = '😅 So Close!';
            document.getElementById('winnerSubtext').textContent = 'Better luck next time!';
            document.getElementById('winnerWpm').textContent = isRoomHost ? roomData.hostWpm : roomData.guestWpm;
            document.getElementById('winnerAccuracy').textContent = (isRoomHost ? roomData.hostAccuracy : roomData.guestAccuracy) + '%';
        }
        
        setTimeout(() => {
            document.getElementById('winnerCelebration').classList.add('show');
            if (youWon) fireConfetti();
        }, 500);
    }
}

// Reset Test
function resetTest() {
    clearInterval(timerInterval);
    isTestActive = false;
    characterErrors = 0;
    totalCharacters = 0;
    
    inputArea.value = '';
    inputArea.disabled = true;
    quoteDisplay.textContent = 'Click "Start Test" to begin...';
    
    document.getElementById('wpm').textContent = '0';
    document.getElementById('accuracy').textContent = '0%';
    document.getElementById('time').textContent = '0s';
    
    startBtn.textContent = '▶️ Start Test';
    startBtn.disabled = false;
    
    results.classList.remove('show');
    
    // Remove winner styling
    document.getElementById('playerCardYou').classList.remove('winner');
    document.getElementById('playerCardOpponent').classList.remove('winner');
}

// Close Celebration
function closeCelebration() {
    document.getElementById('winnerCelebration').classList.remove('show');
    resetTest();
}

// Confetti Effect
function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#fbbf24'];
    
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20 - 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
    
    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.rotation += p.rotationSpeed;
            p.size *= 0.99;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });
        
        frame++;
        if (frame < 150) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to start
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!isTestActive) startTest();
        }
        
        // Ctrl/Cmd + R to reset
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            resetTest();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            document.getElementById('shortcutsModal').classList.remove('show');
        }
        
        // ? to show shortcuts
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            showShortcuts();
        }
    });
}

// Show Shortcuts Modal
function showShortcuts() {
    document.getElementById('shortcutsModal').classList.add('show');
}

// Hide Shortcuts Modal
function hideShortcuts() {
    document.getElementById('shortcutsModal').classList.remove('show');
}

// Offline Indicator
function setupOfflineIndicator() {
    const indicator = document.getElementById('offlineIndicator');
    
    window.addEventListener('online', () => {
        indicator.classList.remove('show');
        showToast('Back online!');
    });
    
    window.addEventListener('offline', () => {
        indicator.classList.add('show');
        showToast('You are offline. Some features may not work.');
    });
    
    if (!navigator.onLine) {
        indicator.classList.add('show');
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Usage Stats
function trackUsageStats() {
    const stats = JSON.parse(localStorage.getItem('typing-stats') || '{}');
    stats.visits = (stats.visits || 0) + 1;
    stats.lastVisit = new Date().toISOString();
    localStorage.setItem('typing-stats', JSON.stringify(stats));
}

// Cleanup old rooms on load
function cleanupOldRooms() {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('typing_room_')) {
            const room = JSON.parse(localStorage.getItem(key));
            if (room && now - room.created > 3600000) { // 1 hour
                localStorage.removeItem(key);
            }
        }
    }
}

// Run cleanup
cleanupOldRooms();
