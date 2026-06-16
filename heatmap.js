// Typing Heatmap Visualizer - Shows typing patterns and accuracy per key

const HeatmapVisualizer = {
    STORAGE_KEY: 'typing_heatmap_data',
    isVisible: false,
    
    // Keyboard layout
    keyboardRows: [
        ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
        ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
        ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
        ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
        ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctrl']
    ],
    
    // Initialize
    init() {
        this.createToggleButton();
        this.createHeatmapModal();
        this.loadData();
        
        // Hook into typing events
        this.hookTypingEvents();
    },
    
    // Get default data structure
    getDefaultData() {
        return {
            keyStats: {}, // key -> { correct: 0, incorrect: 0, total: 0 }
            totalKeystrokes: 0,
            sessionsAnalyzed: 0,
            lastUpdated: null
        };
    },
    
    // Load data from storage
    loadData() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading heatmap data:', e);
            }
        }
        return this.getDefaultData();
    },
    
    // Save data to storage
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    
    // Record a keystroke
    recordKeystroke(key, isCorrect) {
        const data = this.loadData();
        
        // Normalize key
        const normalizedKey = this.normalizeKey(key);
        if (!normalizedKey) return;
        
        if (!data.keyStats[normalizedKey]) {
            data.keyStats[normalizedKey] = { correct: 0, incorrect: 0, total: 0 };
        }
        
        const stats = data.keyStats[normalizedKey];
        stats.total++;
        data.totalKeystrokes++;
        
        if (isCorrect) {
            stats.correct++;
        } else {
            stats.incorrect++;
        }
        
        data.lastUpdated = new Date().toISOString();
        this.saveData(data);
    },
    
    // Normalize key name
    normalizeKey(key) {
        // Map special keys
        const keyMap = {
            ' ': 'Space',
            'Enter': 'Enter',
            'Tab': 'Tab',
            'Backspace': 'Backspace',
            'CapsLock': 'Caps',
            'Shift': 'Shift',
            'Control': 'Ctrl',
            'Alt': 'Alt',
            'Meta': 'Win',
            'Escape': 'Esc'
        };
        
        if (keyMap[key]) return keyMap[key];
        
        // Convert to lowercase for letters
        if (key.length === 1 && /[a-zA-Z]/.test(key)) {
            return key.toLowerCase();
        }
        
        return key;
    },
    
    // Hook into typing events
    hookTypingEvents() {
        const inputArea = document.getElementById('inputArea');
        const quoteDisplay = document.getElementById('quoteDisplay');
        
        if (!inputArea || !quoteDisplay) return;
        
        let lastInputLength = 0;
        
        inputArea.addEventListener('input', (e) => {
            const currentText = inputArea.value;
            const quoteText = quoteDisplay.querySelector('.quote-text')?.textContent || 
                             quoteDisplay.textContent;
            
            if (e.inputType === 'deleteContentBackward') {
                lastInputLength = currentText.length;
                return;
            }
            
            // Check each new character
            for (let i = lastInputLength; i < currentText.length; i++) {
                const typedChar = currentText[i];
                const expectedChar = quoteText[i];
                
                if (typedChar && expectedChar) {
                    const isCorrect = typedChar === expectedChar;
                    this.recordKeystroke(typedChar, isCorrect);
                }
            }
            
            lastInputLength = currentText.length;
        });
        
        // Reset tracking when test starts
        const observer = new MutationObserver(() => {
            if (!inputArea.disabled) {
                lastInputLength = 0;
            }
        });
        
        observer.observe(inputArea, { attributes: true, attributeFilter: ['disabled'] });
    },
    
    // Create toggle button
    createToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'heatmapToggle';
        btn.title = 'View Typing Heatmap';
        btn.innerHTML = '🔥 Heatmap';
        btn.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        `;
        btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        btn.onclick = () => this.showHeatmap();
        document.body.appendChild(btn);
    },
    
    // Create heatmap modal
    createHeatmapModal() {
        const modal = document.createElement('div');
        modal.id = 'heatmapModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
            backdrop-filter: blur(5px);
        `;
        
        modal.innerHTML = `
            <div id="heatmapContent" style="
                background: var(--bg-card, white);
                border-radius: 20px;
                padding: 30px;
                max-width: 900px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                animation: heatmapSlideIn 0.3s ease;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <h2 style="color: var(--text-primary, #1f2937); margin: 0; display: flex; align-items: center; gap: 10px;">
                        🔥 Typing Heatmap
                    </h2>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <select id="heatmapMode" style="padding: 8px 15px; border-radius: 8px; border: 2px solid var(--border-color, #e5e7eb); background: var(--bg-input, #f3f4f6); color: var(--text-primary, #1f2937); cursor: pointer;">
                            <option value="frequency">Frequency</option>
                            <option value="accuracy">Accuracy</option>
                            <option value="errors">Errors</option>
                        </select>
                        <button id="clearHeatmapData" style="padding: 8px 15px; background: var(--error, #ef4444); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">🗑️ Clear</button>
                        <button id="closeHeatmap" style="padding: 8px 15px; background: var(--accent-primary, #667eea); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">✕ Close</button>
                    </div>
                </div>
                
                <div id="heatmapStats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <!-- Stats populated by JS -->
                </div>
                
                <div id="heatmapLegend" style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
                    <span style="color: var(--text-muted, #6b7280);">Low</span>
                    <div id="legendGradient" style="width: 200px; height: 20px; border-radius: 10px; background: linear-gradient(90deg, #e5e7eb, #ff6b6b, #c0392b);"></div>
                    <span style="color: var(--text-muted, #6b7280);">High</span>
                </div>
                
                <div id="heatmapKeyboard" style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; background: var(--bg-card-secondary, #f9fafb); border-radius: 12px;">
                    <!-- Keyboard populated by JS -->
                </div>
                
                <div id="heatmapInsights" style="margin-top: 25px; padding: 20px; background: var(--bg-card-secondary, #f9fafb); border-radius: 12px;">
                    <h3 style="color: var(--text-primary, #1f2937); margin: 0 0 15px 0;">📊 Insights</h3>
                    <div id="insightsContent">
                        <!-- Insights populated by JS -->
                    </div>
                </div>
            </div>
            <style>
                @keyframes heatmapSlideIn {
                    from { opacity: 0; transform: translateY(-30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .heatmap-key {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 50px;
                    height: 50px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.9em;
                    transition: all 0.2s;
                    cursor: pointer;
                    position: relative;
                    user-select: none;
                }
                .heatmap-key:hover {
                    transform: scale(1.1);
                    z-index: 10;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .heatmap-key .key-stats {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(-5px);
                    background: rgba(0,0,0,0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 0.75em;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 100;
                }
                .heatmap-key:hover .key-stats {
                    opacity: 1;
                }
                @media (max-width: 768px) {
                    .heatmap-key {
                        min-width: 30px;
                        height: 40px;
                        font-size: 0.7em;
                    }
                }
            </style>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('closeHeatmap').onclick = () => this.hideHeatmap();
        document.getElementById('clearHeatmapData').onclick = () => this.clearData();
        document.getElementById('heatmapMode').onchange = () => this.renderKeyboard();
        
        // Close on backdrop click
        modal.onclick = (e) => {
            if (e.target === modal) this.hideHeatmap();
        };
        
        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideHeatmap();
            }
        });
    },
    
    // Show heatmap
    showHeatmap() {
        this.isVisible = true;
        const modal = document.getElementById('heatmapModal');
        modal.style.display = 'flex';
        this.renderStats();
        this.renderKeyboard();
        this.renderInsights();
    },
    
    // Hide heatmap
    hideHeatmap() {
        this.isVisible = false;
        const modal = document.getElementById('heatmapModal');
        modal.style.display = 'none';
    },
    
    // Render stats
    renderStats() {
        const data = this.loadData();
        const container = document.getElementById('heatmapStats');
        
        let totalCorrect = 0;
        let totalIncorrect = 0;
        let mostUsedKey = '-';
        let mostUsedCount = 0;
        let weakestKey = '-';
        let lowestAccuracy = 100;
        
        Object.entries(data.keyStats).forEach(([key, stats]) => {
            totalCorrect += stats.correct;
            totalIncorrect += stats.incorrect;
            
            if (stats.total > mostUsedCount) {
                mostUsedCount = stats.total;
                mostUsedKey = key;
            }
            
            const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
            if (stats.total >= 5 && accuracy < lowestAccuracy) {
                lowestAccuracy = accuracy;
                weakestKey = key;
            }
        });
        
        const totalTyped = totalCorrect + totalIncorrect;
        const overallAccuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 0;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 12px;">
                <div style="font-size: 2em; font-weight: 700; color: var(--accent-primary, #667eea);">${totalTyped.toLocaleString()}</div>
                <div style="color: var(--text-muted, #6b7280); font-size: 0.9em;">Total Keystrokes</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #10b98120, #05966920); border-radius: 12px;">
                <div style="font-size: 2em; font-weight: 700; color: #10b981;">${overallAccuracy}%</div>
                <div style="color: var(--text-muted, #6b7280); font-size: 0.9em;">Overall Accuracy</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f59e0b20, #d9770620); border-radius: 12px;">
                <div style="font-size: 2em; font-weight: 700; color: #f59e0b;">${mostUsedKey.toUpperCase()}</div>
                <div style="color: var(--text-muted, #6b7280); font-size: 0.9em;">Most Used (${mostUsedCount.toLocaleString()})</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #ef444420, #dc262620); border-radius: 12px;">
                <div style="font-size: 2em; font-weight: 700; color: #ef4444;">${weakestKey.toUpperCase()}</div>
                <div style="color: var(--text-muted, #6b7280); font-size: 0.9em;">Needs Practice (${Math.round(lowestAccuracy)}%)</div>
            </div>
        `;
    },
    
    // Get color for a key
    getKeyColor(key, mode) {
        const data = this.loadData();
        const stats = data.keyStats[key];
        
        if (!stats || stats.total === 0) {
            return { bg: '#e5e7eb', text: '#6b7280' };
        }
        
        let intensity = 0;
        
        if (mode === 'frequency') {
            // Find max frequency
            const maxFreq = Math.max(...Object.values(data.keyStats).map(s => s.total));
            intensity = stats.total / (maxFreq || 1);
        } else if (mode === 'accuracy') {
            const accuracy = stats.correct / stats.total;
            // Green for high accuracy, red for low
            if (accuracy >= 0.95) return { bg: '#10b981', text: 'white' };
            if (accuracy >= 0.90) return { bg: '#34d399', text: 'white' };
            if (accuracy >= 0.80) return { bg: '#fbbf24', text: '#1f2937' };
            if (accuracy >= 0.70) return { bg: '#f59e0b', text: 'white' };
            return { bg: '#ef4444', text: 'white' };
        } else if (mode === 'errors') {
            // Find max errors
            const maxErrors = Math.max(...Object.values(data.keyStats).map(s => s.incorrect));
            intensity = stats.incorrect / (maxErrors || 1);
        }
        
        // Interpolate color
        if (intensity < 0.2) return { bg: '#e5e7eb', text: '#6b7280' };
        if (intensity < 0.4) return { bg: '#fca5a5', text: '#1f2937' };
        if (intensity < 0.6) return { bg: '#f87171', text: 'white' };
        if (intensity < 0.8) return { bg: '#ef4444', text: 'white' };
        return { bg: '#dc2626', text: 'white' };
    },
    
    // Render keyboard
    renderKeyboard() {
        const mode = document.getElementById('heatmapMode').value;
        const container = document.getElementById('heatmapKeyboard');
        const data = this.loadData();
        
        // Update legend for mode
        const legendGradient = document.getElementById('legendGradient');
        if (mode === 'accuracy') {
            legendGradient.style.background = 'linear-gradient(90deg, #ef4444, #fbbf24, #10b981)';
        } else {
            legendGradient.style.background = 'linear-gradient(90deg, #e5e7eb, #ff6b6b, #c0392b)';
        }
        
        container.innerHTML = this.keyboardRows.map(row => {
            return `<div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">` + 
                row.map(key => {
                    const color = this.getKeyColor(key.toLowerCase(), mode);
                    const stats = data.keyStats[key.toLowerCase()];
                    const accuracy = stats ? Math.round((stats.correct / stats.total) * 100) : 0;
                    const tooltip = stats ? 
                        `<div class="key-stats">
                            <strong>${key}</strong><br>
                            Typed: ${stats.total}<br>
                            Correct: ${stats.correct}<br>
                            Errors: ${stats.incorrect}<br>
                            Accuracy: ${accuracy}%
                        </div>` : '';
                    
                    // Special sizing for special keys
                    let width = '50px';
                    if (['Backspace', 'Tab', 'Caps', 'Enter', 'Shift', 'Ctrl', 'Win', 'Alt', 'Fn', 'Space'].includes(key)) {
                        if (key === 'Space') width = '200px';
                        else if (['Shift', 'Enter', 'Backspace'].includes(key)) width = '80px';
                        else width = '60px';
                    }
                    
                    return `<div class="heatmap-key" style="
                        min-width: ${width}; 
                        background: ${color.bg}; 
                        color: ${color.text};
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    ">${key}${tooltip}</div>`;
                }).join('') + 
            `</div>`;
        }).join('');
    },
    
    // Render insights
    renderInsights() {
        const data = this.loadData();
        const container = document.getElementById('insightsContent');
        
        if (Object.keys(data.keyStats).length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted, #6b7280);">Start typing to generate insights! Your typing patterns will appear here after a few sessions.</p>';
            return;
        }
        
        // Find most problematic keys
        const problematicKeys = Object.entries(data.keyStats)
            .filter(([_, stats]) => stats.total >= 5)
            .map(([key, stats]) => ({
                key,
                accuracy: (stats.correct / stats.total) * 100,
                errors: stats.incorrect
            }))
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5);
        
        // Calculate hand distribution (simplified)
        const leftKeys = 'qwertasdfgzxcvb`12345';
        const rightKeys = 'yuiophjkl;nm,./67890-=[]\\';
        let leftCount = 0;
        let rightCount = 0;
        
        Object.entries(data.keyStats).forEach(([key, stats]) => {
            if (leftKeys.includes(key)) leftCount += stats.total;
            else if (rightKeys.includes(key)) rightCount += stats.total;
        });
        
        const total = leftCount + rightCount;
        const leftPercent = total > 0 ? Math.round((leftCount / total) * 100) : 50;
        const rightPercent = 100 - leftPercent;
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div>
                    <h4 style="color: var(--text-secondary, #6b7280); margin: 0 0 10px 0; font-size: 0.9em;">🎯 Keys That Need Practice</h4>
                    ${problematicKeys.length > 0 ? `
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${problematicKeys.map(k => `
                                <div style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
                                    <span style="font-weight: 700; font-size: 1.2em; min-width: 30px;">${k.key.toUpperCase()}</span>
                                    <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${k.accuracy}%; height: 100%; background: ${k.accuracy < 70 ? '#ef4444' : k.accuracy < 90 ? '#f59e0b' : '#10b981'};"></div>
                                    </div>
                                    <span style="font-size: 0.85em; min-width: 45px; text-align: right;">${Math.round(k.accuracy)}%</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--text-muted, #6b7280);">No problematic keys yet - keep practicing!</p>'}
                </div>
                
                <div>
                    <h4 style="color: var(--text-secondary, #6b7280); margin: 0 0 10px 0; font-size: 0.9em;">✋ Hand Distribution</h4>
                    <div style="background: rgba(102, 126, 234, 0.1); border-radius: 12px; padding: 15px;">
                        <div style="display: flex; height: 30px; border-radius: 15px; overflow: hidden; margin-bottom: 10px;">
                            <div style="width: ${leftPercent}%; background: linear-gradient(90deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.85em;">
                                ${leftPercent > 15 ? 'L' : ''}
                            </div>
                            <div style="width: ${rightPercent}%; background: linear-gradient(90deg, #f093fb, #f5576c); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.85em;">
                                ${rightPercent > 15 ? 'R' : ''}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                            <span style="color: #667eea; font-weight: 600;">Left: ${leftPercent}%</span>
                            <span style="color: #f5576c; font-weight: 600;">Right: ${rightPercent}%</span>
                        </div>
                    </div>
                    ${Math.abs(leftPercent - 50) > 15 ? `
                        <p style="color: var(--warning, #f59e0b); font-size: 0.85em; margin-top: 10px;">
                            ⚠️ Your typing is ${leftPercent > 60 ? 'left' : 'right'}-hand dominant. Try to balance your typing for better ergonomics.
                        </p>
                    ` : `
                        <p style="color: #10b981; font-size: 0.85em; margin-top: 10px;">
                            ✓ Great hand balance! You're using both hands effectively.
                        </p>
                    `}
                </div>
            </div>
        `;
    },
    
    // Clear all heatmap data
    clearData() {
        if (confirm('Are you sure you want to clear all heatmap data? This cannot be undone.')) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.renderStats();
            this.renderKeyboard();
            this.renderInsights();
            showToast('Heatmap data cleared!', 2000);
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HeatmapVisualizer.init());
} else {
    HeatmapVisualizer.init();
}
