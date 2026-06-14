// Typing Speed Test - Clean JavaScript

// Theme Management
const ThemeManager = {
    key: 'typing-test-theme',
    current: 'light',
    
    init() {
        // Load saved theme
        const saved = localStorage.getItem(this.key);
        if (saved && ['light', 'dark'].includes(saved)) {
            this.current = saved;
        } else {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.current = 'dark';
            }
        }
        this.apply();
        this.createToggle();
    },
    
    apply() {
        document.documentElement.setAttribute('data-theme', this.current);
        this.updateToggleIcon();
    },
    
    toggle() {
        this.current = this.current === 'light' ? 'dark' : 'light';
        localStorage.setItem(this.key, this.current);
        this.apply();
        showToast(`Switched to ${this.current} mode`);
    },
    
    createToggle() {
        // Remove existing if any
        const existing = document.getElementById('themeToggle');
        if (existing) existing.remove();
        
        const btn = document.createElement('button');
        btn.id = 'themeToggle';
        btn.className = 'theme-toggle';
        btn.title = 'Toggle Theme (T)';
        btn.innerHTML = this.current === 'light' ? '☀️' : '🌙';
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
    },
    
    updateToggleIcon() {
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.innerHTML = this.current === 'light' ? '☀️' : '🌙';
        }
    }
};

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

// Advanced Statistics System
const AdvancedStats = {
    STORAGE_KEY: 'typing_advanced_stats',
    
    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : this.getDefaultData();
    },
    
    getDefaultData() {
        return {
            sessions: [],
            dailyStats: {},
            weeklyStats: {},
            monthlyStats: {},
            streaks: {
                current: 0,
                longest: 0,
                lastPractice: null
            },
            skillLevel: 'Beginner',
            improvement: {
                wpmTrend: [],
                accuracyTrend: []
            },
            timeDistribution: {
                morning: 0,   // 6-12
                afternoon: 0, // 12-18
                evening: 0,   // 18-22
                night: 0      // 22-6
            },
            weakChars: {},
            totalPracticeTime: 0
        };
    },
    
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    
    recordSession(session) {
        const data = this.getData();
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const weekStr = this.getWeekKey(now);
        const monthStr = dateStr.substring(0, 7);
        
        // Add to sessions
        data.sessions.unshift({
            ...session,
            date: now.toISOString(),
            id: 'sess_' + Date.now()
        });
        if (data.sessions.length > 100) data.sessions.pop();
        
        // Update daily stats
        if (!data.dailyStats[dateStr]) {
            data.dailyStats[dateStr] = { tests: 0, avgWpm: 0, avgAccuracy: 0, totalChars: 0 };
        }
        const day = data.dailyStats[dateStr];
        day.tests++;
        day.avgWpm = Math.round((day.avgWpm * (day.tests - 1) + session.wpm) / day.tests);
        day.avgAccuracy = Math.round((day.avgAccuracy * (day.tests - 1) + session.accuracy) / day.tests * 10) / 10;
        day.totalChars += session.characters;
        
        // Update weekly stats
        if (!data.weeklyStats[weekStr]) {
            data.weeklyStats[weekStr] = { tests: 0, avgWpm: 0, avgAccuracy: 0 };
        }
        const week = data.weeklyStats[weekStr];
        week.tests++;
        week.avgWpm = Math.round((week.avgWpm * (week.tests - 1) + session.wpm) / week.tests);
        
        // Update monthly stats
        if (!data.monthlyStats[monthStr]) {
            data.monthlyStats[monthStr] = { tests: 0, avgWpm: 0, bestWpm: 0 };
        }
        const month = data.monthlyStats[monthStr];
        month.tests++;
        month.avgWpm = Math.round((month.avgWpm * (month.tests - 1) + session.wpm) / month.tests);
        month.bestWpm = Math.max(month.bestWpm, session.wpm);
        
        // Update streak
        this.updateStreak(data, now);
        
        // Update time distribution
        const hour = now.getHours();
        if (hour >= 6 && hour < 12) data.timeDistribution.morning++;
        else if (hour >= 12 && hour < 18) data.timeDistribution.afternoon++;
        else if (hour >= 18 && hour < 22) data.timeDistribution.evening++;
        else data.timeDistribution.night++;
        
        // Update trends
        data.improvement.wpmTrend.push(session.wpm);
        data.improvement.accuracyTrend.push(session.accuracy);
        if (data.improvement.wpmTrend.length > 30) {
            data.improvement.wpmTrend.shift();
            data.improvement.accuracyTrend.shift();
        }
        
        // Update skill level
        data.skillLevel = this.calculateSkillLevel(data);
        
        // Update practice time
        data.totalPracticeTime += session.timeSeconds;
        
        this.saveData(data);
        return data;
    },
    
    getWeekKey(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        return d.toISOString().split('T')[0];
    },
    
    updateStreak(data, now) {
        const today = now.toISOString().split('T')[0];
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (data.streaks.lastPractice === today) {
            return; // Already practiced today
        }
        
        if (data.streaks.lastPractice === yesterdayStr) {
            data.streaks.current++;
        } else {
            data.streaks.current = 1;
        }
        
        data.streaks.lastPractice = today;
        data.streaks.longest = Math.max(data.streaks.longest, data.streaks.current);
    },
    
    calculateSkillLevel(data) {
        const recentSessions = data.sessions.slice(0, 10);
        if (recentSessions.length < 3) return 'Beginner';
        
        const avgWpm = recentSessions.reduce((s, x) => s + x.wpm, 0) / recentSessions.length;
        const avgAcc = recentSessions.reduce((s, x) => s + x.accuracy, 0) / recentSessions.length;
        
        if (avgWpm >= 80 && avgAcc >= 98) return 'Expert';
        if (avgWpm >= 60 && avgAcc >= 95) return 'Advanced';
        if (avgWpm >= 40 && avgAcc >= 90) return 'Intermediate';
        return 'Beginner';
    },
    
    getStatsSummary() {
        const data = this.getData();
        const sessions = data.sessions;
        
        if (sessions.length === 0) return null;
        
        const recent = sessions.slice(0, 10);
        const avgWpm = Math.round(recent.reduce((s, x) => s + x.wpm, 0) / recent.length);
        const avgAcc = Math.round(recent.reduce((s, x) => s + x.accuracy, 0) / recent.length * 10) / 10;
        const bestWpm = Math.max(...sessions.map(s => s.wpm));
        const totalTests = sessions.length;
        
        // Calculate consistency (lower std dev = more consistent)
        const wpmValues = recent.map(s => s.wpm);
        const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
        const variance = wpmValues.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / wpmValues.length;
        const consistency = Math.round(100 - Math.min(variance / 10, 100));
        
        return {
            avgWpm,
            avgAcc,
            bestWpm,
            totalTests,
            skillLevel: data.skillLevel,
            streak: data.streaks.current,
            longestStreak: data.streaks.longest,
            consistency,
            practiceTime: Math.round(data.totalPracticeTime / 60),
            recentTrend: this.calculateTrend(data.improvement.wpmTrend)
        };
    },
    
    calculateTrend(values) {
        if (values.length < 5) return 'neutral';
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const diff = secondAvg - firstAvg;
        if (diff > 3) return 'improving';
        if (diff < -3) return 'declining';
        return 'stable';
    },
    
    getChartData() {
        const data = this.getData();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            last7Days.push({
                date: d.toLocaleDateString('en', { weekday: 'short' }),
                wpm: data.dailyStats[key]?.avgWpm || 0,
                tests: data.dailyStats[key]?.tests || 0
            });
        }
        return last7Days;
    }
};

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
    // Initialize theme first
    ThemeManager.init();
    
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
        
        // Update advanced stats
        AdvancedStats.recordSession({ wpm, accuracy, characters, errors, timeSeconds });
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
        
        // T to toggle theme
        if (e.key === 't' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            ThemeManager.toggle();
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

// Export Functions
const ExportManager = {
    // Export current session results
    exportCurrentResult() {
        const finalWpm = document.getElementById('finalWpm').textContent;
        const finalAccuracy = document.getElementById('finalAccuracy').textContent;
        const finalChars = document.getElementById('finalChars').textContent;
        const finalErrors = document.getElementById('finalErrors').textContent;
        
        if (finalWpm === '0') {
            showToast('Complete a test first to export results');
            return;
        }
        
        const result = {
            date: new Date().toISOString(),
            wpm: parseInt(finalWpm),
            accuracy: parseInt(finalAccuracy),
            characters: parseInt(finalChars),
            errors: parseInt(finalErrors),
            mode: currentMode,
            quote: currentQuote
        };
        
        this.downloadJSON(result, `typing-result-${Date.now()}.json`);
        showToast('✅ Results exported!');
    },
    
    // Export all session history
    exportHistory() {
        const history = getSessionHistory();
        if (history.length === 0) {
            showToast('No history to export. Complete some tests first!');
            return;
        }
        
        const stats = getStats();
        const exportData = {
            exportDate: new Date().toISOString(),
            summary: {
                bestWpm: stats.bestWpm,
                bestAccuracy: stats.bestAccuracy,
                averageWpm: stats.averageWpm,
                totalTests: stats.totalTests,
                testsCompleted: stats.testsCompleted
            },
            sessions: history
        };
        
        this.downloadJSON(exportData, `typing-history-${new Date().toISOString().split('T')[0]}.json`);
        showToast(`✅ Exported ${history.length} sessions!`);
    },
    
    // Export as CSV
    exportHistoryCSV() {
        const history = getSessionHistory();
        if (history.length === 0) {
            showToast('No history to export. Complete some tests first!');
            return;
        }
        
        const headers = ['Date', 'WPM', 'Accuracy (%)', 'Characters', 'Errors', 'Time (s)', 'Mode'];
        const rows = history.map(session => [
            new Date(session.date).toLocaleString(),
            session.wpm,
            session.accuracy,
            session.characters,
            session.errors,
            session.timeSeconds,
            session.mode
        ]);
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        this.downloadCSV(csv, `typing-history-${new Date().toISOString().split('T')[0]}.csv`);
        showToast(`✅ Exported ${history.length} sessions as CSV!`);
    },
    
    // Download helper
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    downloadCSV(data, filename) {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

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

// Advanced Statistics UI Controller
const StatsUI = {
    modal: null,
    
    init() {
        this.createStatsButton();
        this.createModal();
    },
    
    createStatsButton() {
        const btn = document.createElement('button');
        btn.id = 'advancedStatsBtn';
        btn.className = 'btn btn-stats';
        btn.innerHTML = '📊 Advanced Stats';
        btn.onclick = () => this.show();
        
        // Insert after personal stats section
        const section = document.getElementById('personalStatsSection');
        if (section) {
            section.querySelector('.personal-stats-header').appendChild(btn);
        }
    },
    
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'advancedStatsModal';
        modal.className = 'stats-modal';
        modal.innerHTML = `
            <div class="stats-content">
                <div class="stats-header">
                    <h2>📊 Advanced Statistics</h2>
                    <button class="close-stats" onclick="StatsUI.hide()">&times;</button>
                </div>
                <div class="stats-body" id="statsBody">
                    <!-- Content populated dynamically -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hide();
        });
    },
    
    show() {
        this.render();
        this.modal.classList.add('show');
    },
    
    hide() {
        this.modal.classList.remove('show');
    },
    
    render() {
        const summary = AdvancedStats.getStatsSummary();
        const chartData = AdvancedStats.getChartData();
        const data = AdvancedStats.getData();
        
        let html = '';
        
        if (!summary) {
            html = `
                <div class="stats-empty">
                    <div class="stats-empty-icon">📊</div>
                    <h3>No Statistics Yet</h3>
                    <p>Complete some typing tests to see your advanced analytics!</p>
                </div>
            `;
        } else {
            // Skill Level Badge
            const levelColors = {
                'Beginner': '#f59e0b',
                'Intermediate': '#10b981',
                'Advanced': '#8b5cf6',
                'Expert': '#ec4899'
            };
            
            // Trend indicator
            const trendIcons = {
                'improving': '📈',
                'stable': '➡️',
                'declining': '📉',
                'neutral': '➖'
            };
            
            html = `
                <div class="stats-grid">
                    <!-- Skill Level Card -->
                    <div class="stats-card stats-highlight">
                        <div class="stats-card-header">
                            <span class="stats-label">Skill Level</span>
                            <span class="stats-trend">${trendIcons[summary.recentTrend]}</span>
                        </div>
                        <div class="stats-skill-badge" style="background: ${levelColors[summary.skillLevel]}">
                            ${summary.skillLevel}
                        </div>
                        <div class="stats-subtext">${summary.recentTrend === 'improving' ? 'Keep it up! You\'re getting faster!' : 'Practice daily to improve!'}</div>
                    </div>
                    
                    <!-- Streak Card -->
                    <div class="stats-card">
                        <div class="stats-card-header">
                            <span class="stats-label">🔥 Streak</span>
                        </div>
                        <div class="stats-big-value">${summary.streak}</div>
                        <div class="stats-subtext">day${summary.streak !== 1 ? 's' : ''} in a row</div>
                        ${summary.longestStreak > summary.streak ? `<div class="stats-mini">Best: ${summary.longestStreak} days</div>` : ''}
                    </div>
                    
                    <!-- Consistency Card -->
                    <div class="stats-card">
                        <div class="stats-card-header">
                            <span class="stats-label">🎯 Consistency</span>
                        </div>
                        <div class="stats-big-value">${summary.consistency}%</div>
                        <div class="stats-subtext">Score stability</div>
                        <div class="stats-progress-bar">
                            <div class="stats-progress-fill" style="width: ${summary.consistency}%"></div>
                        </div>
                    </div>
                    
                    <!-- Practice Time Card -->
                    <div class="stats-card">
                        <div class="stats-card-header">
                            <span class="stats-label">⏱️ Practice Time</span>
                        </div>
                        <div class="stats-big-value">${summary.practiceTime}</div>
                        <div class="stats-subtext">minutes total</div>
                    </div>
                </div>
                
                <!-- Performance Chart -->
                <div class="stats-section">
                    <h3>📈 7-Day Performance</h3>
                    <div class="stats-chart-container">
                        <svg class="stats-chart" viewBox="0 0 700 200" preserveAspectRatio="none">
                            ${this.renderChart(chartData)}
                        </svg>
                        <div class="stats-chart-labels">
                            ${chartData.map(d => `
                                <div class="chart-label ${d.tests === 0 ? 'empty' : ''}">
                                    <span class="chart-day">${d.date}</span>
                                    ${d.tests > 0 ? `<span class="chart-wpm">${d.wpm} WPM</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Time Distribution -->
                <div class="stats-section">
                    <h3>🕐 When You Practice</h3>
                    <div class="time-distribution">
                        ${this.renderTimeDistribution(data.timeDistribution)}
                    </div>
                </div>
                
                <!-- Quick Stats Row -->
                <div class="stats-quick-row">
                    <div class="stats-quick-item">
                        <span class="quick-value">${summary.avgWpm}</span>
                        <span class="quick-label">Recent Avg WPM</span>
                    </div>
                    <div class="stats-quick-item">
                        <span class="quick-value">${summary.avgAcc}%</span>
                        <span class="quick-label">Recent Avg Acc</span>
                    </div>
                    <div class="stats-quick-item">
                        <span class="quick-value">${summary.bestWpm}</span>
                        <span class="quick-label">Personal Best</span>
                    </div>
                    <div class="stats-quick-item">
                        <span class="quick-value">${summary.totalTests}</span>
                        <span class="quick-label">Total Tests</span>
                    </div>
                </div>
            `;
        }
        
        document.getElementById('statsBody').innerHTML = html;
    },
    
    renderChart(data) {
        const maxWpm = Math.max(...data.map(d => d.wpm), 50);
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 650 + 25;
            const y = 180 - (d.wpm / maxWpm) * 150;
            return { x, y, wpm: d.wpm };
        });
        
        // Create smooth curve
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cp1x = prev.x + (curr.x - prev.x) / 2;
            const cp1y = prev.y;
            const cp2x = prev.x + (curr.x - prev.x) / 2;
            const cp2y = curr.y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
        }
        
        // Area fill
        const areaPath = `${path} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;
        
        return `
            <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#667eea;stop-opacity:0" />
                </linearGradient>
            </defs>
            <path d="${areaPath}" fill="url(#chartGradient)" />
            <path d="${path}" fill="none" stroke="#667eea" stroke-width="3" stroke-linecap="round" />
            ${points.map(p => `
                <circle cx="${p.x}" cy="${p.y}" r="6" fill="#667eea" stroke="white" stroke-width="2" />
            `).join('')}
        `;
    },
    
    renderTimeDistribution(dist) {
        const total = Object.values(dist).reduce((a, b) => a + b, 0);
        if (total === 0) return '<p class="stats-empty-msg">No data yet. Complete some tests! 📝</p>';
        
        const periods = [
            { key: 'morning', label: '🌅 Morning', hours: '6am - 12pm', color: '#fbbf24' },
            { key: 'afternoon', label: '☀️ Afternoon', hours: '12pm - 6pm', color: '#f59e0b' },
            { key: 'evening', label: '🌆 Evening', hours: '6pm - 10pm', color: '#8b5cf6' },
            { key: 'night', label: '🌙 Night', hours: '10pm - 6am', color: '#4f46e5' }
        ];
        
        const max = Math.max(...Object.values(dist));
        
        return periods.map(p => {
            const count = dist[p.key] || 0;
            const percent = total > 0 ? (count / total) * 100 : 0;
            const barWidth = max > 0 ? (count / max) * 100 : 0;
            
            return `
                <div class="time-bar-item">
                    <div class="time-bar-label">
                        <span class="time-label-main">${p.label}</span>
                        <span class="time-label-sub">${p.hours}</span>
                    </div>                    <div class="time-bar-track">
                        <div class="time-bar-fill" style="width: ${barWidth}%; background: ${p.color}"></div>
                    </div>
                    <div class="time-bar-value">${count} test${count !== 1 ? 's' : ''}</div>
                </div>
            `;
        }).join('');
    }
};

// Initialize advanced stats UI
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => StatsUI.init(), 100);
});
