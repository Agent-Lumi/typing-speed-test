// Leaderboard Module - Per-difficulty high score tracking
const STORAGE_KEY = 'typing-leaderboard';

const Leaderboard = {
    // Get leaderboard data from localStorage
    getData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : this.getDefaultData();
    },

    // Default leaderboard structure
    getDefaultData() {
        return {
            easy: [],
            medium: [],
            hard: [],
            expert: []
        };
    },

    // Save leaderboard data
    saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    // Add a new score to the leaderboard
    addScore(difficulty, score) {
        const data = this.getData();
        const entry = {
            ...score,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };

        // Add to appropriate difficulty list
        if (!data[difficulty]) {
            data[difficulty] = [];
        }
        data[difficulty].push(entry);

        // Sort by WPM (descending), then accuracy (descending)
        data[difficulty].sort((a, b) => {
            if (b.wpm !== a.wpm) return b.wpm - a.wpm;
            return b.accuracy - a.accuracy;
        });

        // Keep only top 10 scores per difficulty
        data[difficulty] = data[difficulty].slice(0, 10);

        this.saveData(data);
        return this.isHighScore(difficulty, entry);
    },

    // Check if a score is in the top 10
    isHighScore(difficulty, entry) {
        const data = this.getData();
        if (!data[difficulty] || data[difficulty].length === 0) return true;
        
        const scores = data[difficulty];
        // Check if entry is in the saved scores (same timestamp)
        return scores.some(s => s.timestamp === entry.timestamp);
    },

    // Get top scores for a difficulty
    getTopScores(difficulty, limit = 10) {
        const data = this.getData();
        return (data[difficulty] || []).slice(0, limit);
    },

    // Get player's personal best for a difficulty
    getPersonalBest(difficulty) {
        const scores = this.getTopScores(difficulty, 1);
        return scores[0] || null;
    },

    // Clear all leaderboard data
    clearAll() {
        if (confirm('Are you sure you want to clear all leaderboard data? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        }
        return false;
    },

    // Export leaderboard data
    exportData() {
        const data = this.getData();
        const exportObj = {
            version: 1,
            exportedAt: new Date().toISOString(),
            leaderboards: data
        };
        return JSON.stringify(exportObj, null, 2);
    },

    // Import leaderboard data
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.version && data.leaderboards) {
                this.saveData(data.leaderboards);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to import leaderboard data:', e);
            return false;
        }
    },

    // Create leaderboard UI
    createLeaderboardUI() {
        const modalHTML = `
            <div id="leaderboardModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🏆 Leaderboard</h2>
                        <button class="close-btn" onclick="Leaderboard.toggleModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="difficulty-tabs">
                            <button class="tab-btn active" data-difficulty="easy" onclick="Leaderboard.switchTab('easy')">Easy</button>
                            <button class="tab-btn" data-difficulty="medium" onclick="Leaderboard.switchTab('medium')">Medium</button>
                            <button class="tab-btn" data-difficulty="hard" onclick="Leaderboard.switchTab('hard')">Hard</button>
                            <button class="tab-btn" data-difficulty="expert" onclick="Leaderboard.switchTab('expert')">Expert</button>
                        </div>
                        <div id="leaderboardContent" class="leaderboard-content">
                            <p class="empty-msg">Loading...</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Leaderboard.exportLeaderboard()">📥 Export</button>
                        <label class="btn btn-secondary file-input-label">
                            📤 Import
                            <input type="file" id="importLeaderboardFile" accept=".json" onchange="Leaderboard.importLeaderboard(this)" style="display: none;">
                        </label>
                        <button class="btn btn-danger" onclick="Leaderboard.clearAll()">🗑️ Clear All</button>
                    </div>
                </div>
            </div>
        `;

        // Add styles if not already present
        if (!document.getElementById('leaderboardStyles')) {
            const styles = document.createElement('style');
            styles.id = 'leaderboardStyles';
            styles.textContent = `
                #leaderboardModal .modal-content {
                    max-width: 600px;
                }

                .difficulty-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid var(--border-color);
                    padding-bottom: 10px;
                }

                .tab-btn {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .tab-btn:hover {
                    background: var(--accent-color);
                    color: white;
                }

                .tab-btn.active {
                    background: var(--accent-color);
                    color: white;
                }

                .leaderboard-content {
                    min-height: 300px;
                }

                .leaderboard-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .leaderboard-table th,
                .leaderboard-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color);
                }

                .leaderboard-table th {
                    font-weight: 600;
                    color: var(--text-secondary);
                    font-size: 0.85em;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .leaderboard-table tr:hover {
                    background: var(--bg-secondary);
                }

                .rank-cell {
                    font-weight: 700;
                    width: 50px;
                }

                .rank-1 { color: #FFD700; }
                .rank-2 { color: #C0C0C0; }
                .rank-3 { color: #CD7F32; }

                .wpm-cell {
                    font-weight: 600;
                    color: var(--accent-color);
                }

                .accuracy-cell {
                    font-weight: 500;
                }

                .date-cell {
                    color: var(--text-secondary);
                    font-size: 0.9em;
                }

                .empty-msg {
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 40px;
                    font-style: italic;
                }

                .modal-footer {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid var(--border-color);
                }

                .file-input-label {
                    cursor: pointer;
                }
            `;
            document.head.appendChild(styles);
        }

        // Add modal to document if not exists
        if (!document.getElementById('leaderboardModal')) {
            const div = document.createElement('div');
            div.innerHTML = modalHTML;
            document.body.appendChild(div.firstElementChild);
        }
    },

    // Toggle modal visibility
    toggleModal() {
        const modal = document.getElementById('leaderboardModal');
        if (modal) {
            modal.classList.toggle('show');
            if (modal.classList.contains('show')) {
                this.switchTab('easy');
            }
        }
    },

    // Switch difficulty tab
    switchTab(difficulty) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
        });

        // Render scores
        this.renderLeaderboard(difficulty);
    },

    // Render leaderboard for a difficulty
    renderLeaderboard(difficulty) {
        const content = document.getElementById('leaderboardContent');
        const scores = this.getTopScores(difficulty);

        if (scores.length === 0) {
            content.innerHTML = '<p class="empty-msg">No scores yet for this difficulty. Complete a test to get on the leaderboard! 🎯</p>';
            return;
        }

        const html = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>WPM</th>
                        <th>Accuracy</th>
                        <th>Characters</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${scores.map((score, index) => {
                        const date = new Date(score.date);
                        const dateStr = date.toLocaleDateString();
                        const rankClass = index < 3 ? `rank-${index + 1}` : '';
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                        return `
                            <tr>
                                <td class="rank-cell ${rankClass}">${medal}</td>
                                <td class="wpm-cell">${score.wpm}</td>
                                <td class="accuracy-cell">${score.accuracy}%</td>
                                <td>${score.characters}</td>
                                <td class="date-cell">${dateStr}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        content.innerHTML = html;
    },

    // Export leaderboard
    exportLeaderboard() {
        const data = this.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `typing-leaderboard-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showToast === 'function') {
            showToast('Leaderboard exported! 💾', 2000);
        }
    },

    // Import leaderboard
    importLeaderboard(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = this.importData(e.target.result);
            if (success) {
                this.switchTab('easy');
                if (typeof showToast === 'function') {
                    showToast('Leaderboard imported! ✅', 2000);
                }
            } else {
                if (typeof showToast === 'function') {
                    showToast('Failed to import leaderboard. Invalid file format. ❌', 3000);
                }
            }
        };
        reader.readAsText(file);
        input.value = ''; // Reset input
    }
};

// Auto-initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Leaderboard.createLeaderboardUI();
    });
} else {
    Leaderboard.createLeaderboardUI();
}

// Expose to global scope
window.Leaderboard = Leaderboard;
