// Difficulty Levels System for Typing Speed Test
const DifficultySystem = {
    key: 'typing-difficulty-settings',
    
    levels: {
        easy: {
            id: 'easy',
            name: 'Easy',
            icon: '🌱',
            description: 'Short, simple quotes',
            minLength: 20,
            maxLength: 60,
            avgWordLength: 4,
            punctuation: false,
            numbers: false,
            specialChars: false,
            color: '#10b981',
            xpMultiplier: 1.0
        },
        medium: {
            id: 'medium',
            name: 'Medium',
            icon: '🌿',
            description: 'Medium quotes with punctuation',
            minLength: 60,
            maxLength: 120,
            avgWordLength: 5,
            punctuation: true,
            numbers: false,
            specialChars: false,
            color: '#f59e0b',
            xpMultiplier: 1.25
        },
        hard: {
            id: 'hard',
            name: 'Hard',
            icon: '🌳',
            description: 'Long quotes with numbers',
            minLength: 120,
            maxLength: 200,
            avgWordLength: 6,
            punctuation: true,
            numbers: true,
            specialChars: false,
            color: '#ef4444',
            xpMultiplier: 1.5
        },
        expert: {
            id: 'expert',
            name: 'Expert',
            icon: '🔥',
            description: 'Complex text with special chars',
            minLength: 200,
            maxLength: 350,
            avgWordLength: 7,
            punctuation: true,
            numbers: true,
            specialChars: true,
            color: '#8b5cf6',
            xpMultiplier: 2.0
        }
    },
    
    // Quotes database by difficulty
    quotesByDifficulty: {
        easy: [
            "The sun is bright today.",
            "I love to walk my dog.",
            "She likes to read books.",
            "The cat sleeps on the bed.",
            "We eat pizza for dinner.",
            "Birds fly in the sky.",
            "Water is very important.",
            "The baby laughs and plays.",
            "Trees give us fresh air.",
            "Music makes me feel good.",
            "Friends help each other out.",
            "The moon shines at night.",
            "Flowers bloom in spring time.",
            "Smile and have a nice day.",
            "Work hard and dream big."
        ],
        medium: [
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "The only way to do great work is to love what you do every single day.",
            "Innovation distinguishes between a leader and a follower in any field.",
            "Life is what happens when you're busy making other plans for yourself.",
            "The future belongs to those who believe in the beauty of their dreams.",
            "It is during our darkest moments that we must focus to see the light.",
            "Whoever is happy will make others happy too through their actions.",
            "You will face many defeats in life, but never let yourself be defeated.",
            "The greatest glory in living lies not in never falling, but in rising.",
            "In the middle of every difficulty lies opportunity waiting to be found.",
            "The only impossible journey is the one you never begin in life.",
            "Don't watch the clock; do what it does. Keep going forward always.",
            "Believe you can and you're halfway there to achieving your goal.",
            "It does not matter how slowly you go as long as you do not stop.",
            "Everything you've ever wanted is on the other side of fear."
        ],
        hard: [
            "The year was 2084. Dr. Sarah Chen, aged 42, stepped out of her laboratory at 7:30 AM, ready to test the new AI system she had been working on for 3 years and 247 days.",
            "In 1969, Apollo 11 landed on the moon with 2 astronauts. Neil Armstrong was the first to walk, saying those famous words: 'One small step for man, one giant leap for mankind.'",
            "Climate change data from 2020-2024 shows temperatures rising by 1.5°C. Scientists predict that by 2050, we need to reduce CO2 emissions by 45% to avoid catastrophic effects.",
            "The Internet Protocol version 4 (IPv4) uses 32-bit addresses, allowing for 4,294,967,296 unique addresses. IPv6 uses 128-bit addresses, providing 340 undecillion addresses.",
            "Mount Everest stands at 8,848.86 meters (29,031.7 feet) above sea level. It was first summited in 1953 by Edmund Hillary and Tenzing Norgay after a 7-week expedition.",
            "DNA contains 4 bases: adenine (A), thymine (T), guanine (G), and cytosine (C). Human DNA consists of about 3 billion base pairs, and 99.9% is identical across all people."
        ],
        expert: [
            "function optimizeAlgorithm(data) { const startTime = Date.now(); const results = data.filter(x => x.value > 0).map(x => ({ ...x, score: Math.sqrt(x.value) * 100 })).sort((a, b) => b.score - a.score); console.log(`Processed ${data.length} items in ${Date.now() - startTime}ms`); return results; }",
            "SELECT u.username, COUNT(o.order_id) as total_orders, SUM(o.amount) as total_spent FROM users u LEFT JOIN orders o ON u.user_id = o.user_id WHERE o.created_at >= '2024-01-01' GROUP BY u.user_id HAVING total_spent > 1000 ORDER BY total_spent DESC LIMIT 10;",
            "Error: TypeError: Cannot read property 'length' of undefined at /app/src/utils/validator.js:42:15 at processTicksAndRejections (internal/process/task_queues.js:97:5) at async validateInput (/app/src/middleware/validation.js:23:12)",
            "The equation E = mc² (energy equals mass times the speed of light squared) shows that mass and energy are interchangeable. For 1kg of matter, E = 1 × (299,792,458)² ≈ 9 × 10¹⁶ joules!",
            "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><title>Example</title><style>body{margin:0;padding:20px;font-family:sans-serif}</style></head><body><h1>Hello, World!</h1></body></html>"
        ]
    },
    
    currentDifficulty: 'easy',
    
    init() {
        const saved = localStorage.getItem(this.key);
        if (saved && this.levels[saved]) {
            this.currentDifficulty = saved;
        }
        this.createDifficultySelector();
        this.loadPersonalBests();
    },
    
    createDifficultySelector() {
        // Find the stats section to insert after
        const statsSection = document.getElementById('personalStatsSection');
        if (!statsSection) return;
        
        const difficultySection = document.createElement('div');
        difficultySection.className = 'personal-stats-section';
        difficultySection.id = 'difficultySection';
        difficultySection.innerHTML = `
            <div class="personal-stats-header">
                <h2>🎯 Select Difficulty</h2>
                <span class="difficulty-badge ${this.currentDifficulty}" id="currentDifficultyBadge">
                    ${this.levels[this.currentDifficulty].icon} ${this.levels[this.currentDifficulty].name}
                </span>
            </div>
            <div class="difficulty-selector" id="difficultySelector">
                ${Object.values(this.levels).map(level => `
                    <button class="difficulty-btn ${level.id} ${level.id === this.currentDifficulty ? 'active' : ''}" 
                            onclick="DifficultySystem.setDifficulty('${level.id}')"
                            title="${level.description}">
                        <span class="difficulty-icon">${level.icon}</span>
                        <span class="difficulty-label">${level.name}</span>
                        <span class="difficulty-desc">${level.description}</span>
                    </button>
                `).join('')}
            </div>
            <div class="difficulty-info" id="difficultyInfo">
                ${this.getDifficultyInfoHTML(this.currentDifficulty)}
            </div>
            <div class="personal-bests-grid" id="personalBestsGrid">
                <!-- Populated by JS -->
            </div>
        `;
        
        statsSection.parentNode.insertBefore(difficultySection, statsSection.nextSibling);
        this.renderPersonalBests();
    },
    
    getDifficultyInfoHTML(difficulty) {
        const level = this.levels[difficulty];
        return `
            <div class="difficulty-stat">
                <span class="icon">📏</span>
                <span>${level.minLength}-${level.maxLength} chars</span>
            </div>
            <div class="difficulty-stat">
                <span class="icon">⭐</span>
                <span>${level.xpMultiplier}x XP</span>
            </div>
            <div class="difficulty-stat">
                <span class="icon">📝</span>
                <span>${level.punctuation ? 'With' : 'No'} punctuation</span>
            </div>
            <div class="difficulty-stat">
                <span class="icon">🔢</span>
                <span>${level.numbers ? 'With' : 'No'} numbers</span>
            </div>
        `;
    },
    
    setDifficulty(difficulty) {
        if (!this.levels[difficulty]) return;
        
        this.currentDifficulty = difficulty;
        localStorage.setItem(this.key, difficulty);
        
        // Update UI
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.classList.contains(difficulty)) {
                btn.classList.add('active');
            }
        });
        
        const badge = document.getElementById('currentDifficultyBadge');
        if (badge) {
            badge.className = `difficulty-badge ${difficulty}`;
            badge.innerHTML = `${this.levels[difficulty].icon} ${this.levels[difficulty].name}`;
        }
        
        const info = document.getElementById('difficultyInfo');
        if (info) {
            info.innerHTML = this.getDifficultyInfoHTML(difficulty);
        }
        
        // Show toast
        if (typeof showToast === 'function') {
            showToast(`Switched to ${this.levels[difficulty].name} mode`);
        }
        
        // Reset test if active
        if (typeof resetTest === 'function') {
            resetTest();
        }
    },
    
    getRandomQuote() {
        const quotes = this.quotesByDifficulty[this.currentDifficulty] || this.quotesByDifficulty.easy;
        return quotes[Math.floor(Math.random() * quotes.length)];
    },
    
    // Personal bests by difficulty
    getPersonalBest(difficulty) {
        const key = `typing-personal-best-${difficulty}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
    },
    
    savePersonalBest(difficulty, wpm, accuracy) {
        const key = `typing-personal-best-${difficulty}`;
        const current = this.getPersonalBest(difficulty);
        
        if (!current || wpm > current.wpm) {
            localStorage.setItem(key, JSON.stringify({
                wpm,
                accuracy,
                date: new Date().toISOString()
            }));
            return true; // New personal best
        }
        return false;
    },
    
    loadPersonalBests() {
        this.renderPersonalBests();
    },
    
    renderPersonalBests() {
        const grid = document.getElementById('personalBestsGrid');
        if (!grid) return;
        
        grid.innerHTML = Object.values(this.levels).map(level => {
            const best = this.getPersonalBest(level.id);
            return `
                <div class="personal-best-card ${level.id}">
                    <div class="personal-best-title">${level.icon} ${level.name} Best</div>
                    <div class="personal-best-value">
                        ${best ? `${best.wpm} <small>WPM</small>` : '<span class="personal-best-empty">-</span>'}
                    </div>
                    ${best ? `<div style="font-size: 0.75em; color: var(--text-muted);">${best.accuracy}% accuracy</div>` : ''}
                </div>
            `;
        }).join('');
    },
    
    checkAndUpdatePersonalBest(wpm, accuracy) {
        const isNewBest = this.savePersonalBest(this.currentDifficulty, wpm, accuracy);
        if (isNewBest) {
            this.renderPersonalBests();
        }
        return isNewBest;
    }
};

// Hook into the existing typing test
// Override the quote selection to use difficulty system
if (typeof window !== 'undefined') {
    // Wait for DOM
    document.addEventListener('DOMContentLoaded', () => {
        DifficultySystem.init();
        
        // Override the global quotes array
        window.getRandomQuote = function() {
            return DifficultySystem.getRandomQuote();
        };
        
        // Hook into result saving
        const originalSaveResult = window.saveResult || function() {};
        window.saveResult = function(result) {
            // Check for personal best
            DifficultySystem.checkAndUpdatePersonalBest(result.wpm, result.accuracy);
            // Call original
            return originalSaveResult(result);
        };
    });
}
