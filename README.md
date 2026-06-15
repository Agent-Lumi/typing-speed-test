# ⌨️ Typing Speed Test

A beautiful, interactive typing speed test application with solo and multiplayer modes! Test your Words Per Minute (WPM), accuracy, and race against friends in real-time.

## 🚀 Live Demo

**Try it now:** [https://agent-lumi.github.io/typing-speed-test/](https://agent-lumi.github.io/typing-speed-test/)

## ✨ Features

### Solo Mode
- **Real-time WPM Calculation** - See your typing speed update as you type
- **Accuracy Tracking** - Monitor your typing accuracy percentage
- **Live Timer** - Track your typing time
- **Visual Feedback** - Color-coded characters show correct (green) and incorrect (red) keystrokes
- **Difficulty Levels** - Choose from Easy, Medium, Hard, or Expert modes with tailored content
- **Personal Bests by Difficulty** - Track your best scores separately for each difficulty level
- **15+ Practice Quotes** - Variety of quotes for practice

### Multiplayer Mode 👥
- **Create Race Rooms** - Generate unique 4-character room codes
- **Join Races** - Enter a friend's room code to compete
- **Real-time Progress** - See both players' progress bars update live
- **Live Stats** - Track WPM and accuracy in real-time during the race
- **Winner Celebration** - Confetti animation for the winner!
- **Same Quote** - Both players type the same text for fair comparison

### General Features
- **🌓 Dark/Light Theme Toggle** - Switch between light and dark modes with a single click or press 'T'
- **📊 Personal Statistics** - Track your best WPM, accuracy, average WPM, and total tests taken
- **📜 Session History** - Review your last 50 tests with detailed stats
- **🏆 New Record Celebrations** - Get notified when you beat your personal best
- **Keyboard Shortcuts** - Quick actions with keyboard commands
- **Toast Notifications** - User-friendly feedback messages
- **Offline Support** - Works even when offline
- **PWA Support** - Install as a standalone app on mobile/desktop
- **Responsive Design** - Works beautifully on all devices
- **Clean UI** - Modern, gradient-themed interface with smooth animations
- **🔊 Sound Effects** - Audio feedback for keystrokes, errors, and completion
- **📥 Export Results** - Export test results to JSON and session history to JSON/CSV
- **📤 Import Data** - Import previously exported JSON results or session history
- **🔗 Share Results** - Share your typing scores to X/Twitter, Facebook, Reddit, or copy to clipboard
- **Advanced Statistics** - Track improvement trends, practice streaks, and time distribution

## 🎯 How to Use

### Solo Mode
1. Click **"Solo Mode"** to start practicing alone
2. View your **Personal Statistics** at the top - Best WPM, Best Accuracy, Average WPM, and Total Tests
3. Click **"Start Test"** or press **Ctrl/⌘ + Enter**
4. Type the displayed quote as quickly and accurately as possible
5. Watch your WPM, accuracy, and time update in real-time
6. Complete the test to see your final results
7. Get notified if you set a new personal best!

### Export Your Results
- **Export Current Result** - Click 📥 Export Result button after completing a test to save as JSON
- **Export Full History** - Click 📥 Export JSON or 📊 Export CSV in the history modal
- Keep your typing data backed up or analyze it in spreadsheet apps

### Viewing Your Statistics
- Your stats are displayed at the top of the page
- Click **"View History"** to see your last 50 tests
- Each entry shows: Date, WPM, Accuracy, Characters, Errors, and Mode
- Click **"Clear All Statistics"** to reset (requires confirmation)

### Multiplayer Mode
1. Click **"Race a Friend"** to switch to multiplayer
2. **To Create a Room:**
   - Click "Generate Code" to create a unique room
   - Copy the 4-character code and share it with a friend
   - Wait for them to join
3. **To Join a Room:**
   - Click "Switch to Join"
   - Enter the 4-character room code
   - Click "Join Race"
4. Once both players are ready, either can start the test
5. Race to finish first with the highest accuracy!
6. Celebrate the winner with confetti! 🎉

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + Enter` | Start Test |
| `Ctrl/⌘ + R` | Reset Test |
| `T` | Toggle Dark/Light Theme |
| `?` | Show Keyboard Shortcuts |
| `Escape` | Close Modal |

## 📥 Export Features

### JSON Export
- **Current Result** - Exports the most recent test with date, WPM, accuracy, characters, errors, mode, and the typed quote
- **Full History** - Exports all your sessions plus summary statistics (best WPM, best accuracy, average WPM, total tests)

### CSV Export
- **Full History** - Exports all sessions in spreadsheet format for easy analysis
- Columns: Date, WPM, Accuracy %, Characters, Errors, Time (seconds), Mode

### Usage Ideas
- Track your progress over time in Excel/Sheets
- Compare your stats across different devices
- Share your achievements with friends
- Create custom charts and visualizations

## 🏆 Scoring

### WPM (Words Per Minute)
- Calculated: `(characters / 5) / (time in minutes)`
- Only correctly typed characters count
- Race mode: Higher WPM wins!

### Accuracy
- Percentage of correctly typed characters
- Formula: `(correct / total) × 100`
- Aim for high accuracy alongside speed

### Multiplayer Winner
- Winner is determined by: `WPM × (Accuracy / 100)`
- This balances speed and accuracy for fair competition

## 🛠️ Technologies Used

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **JavaScript** - Real-time typing logic and multiplayer sync
- **localStorage** - Room data synchronization between players
- **Google Fonts** - Inter and JetBrains Mono typography
- **PWA** - Service Worker for offline support

## 📱 Installation (PWA)

You can install this app on your device:

### Chrome/Edge (Desktop)
1. Visit the live demo
2. Click the install icon (➕) in the address bar
3. Follow the prompts

### Safari (iOS)
1. Visit the live demo in Safari
2. Tap Share button → "Add to Home Screen"
3. The app will appear like a native app

### Chrome (Android)
1. Visit the live demo in Chrome
2. Tap the menu → "Add to Home screen"
3. Confirm to install

## 📝 Local Development

```bash
# Clone the repository
git clone https://github.com/Agent-Lumi/typing-speed-test.git

# Navigate to the directory
cd typing-speed-test

# Open in your browser
open index.html

# Or serve with a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

## 🐛 Troubleshooting

**Room not found?**
- Make sure you entered the code correctly (case-insensitive)
- Rooms expire after 1 hour of inactivity
- The host must keep their browser open

**Multiplayer not syncing?**
- Both players must use the same browser (localStorage limitation)
- Works best when both players are on the same device/network
- For true multiplayer, a backend server would be needed

**Install not working?**
- Make sure you're using HTTPS (required for PWA)
- Chrome/Edge recommended for best PWA support

## 🤝 Contributing

Feel free to open issues or submit pull requests to improve the typing test!

## 📄 License

Open source - feel free to use and modify!

---

**Created with 💡 by Lumi for [@shalkith](https://github.com/shalkith)**

## Changelog

### v2.6.0 - Import & Share Update
- **📤 Import Data** - Import previously exported JSON results or session history
- **🔗 Share Results** - Share your typing scores directly to X/Twitter, Facebook, Reddit, or copy to clipboard
- Native Web Share API support for mobile devices
- Visual import validation with real-time preview
- Social media sharing with pre-formatted messages
- Import validation to prevent corrupted data

### v2.5.0 - Difficulty Levels Update
- Added 4 difficulty levels: Easy, Medium, Hard, and Expert
- Easy mode: Simple short sentences, no punctuation or numbers
- Medium mode: Medium length quotes with punctuation
- Hard mode: Longer quotes with numbers and technical content
- Expert mode: Code snippets, SQL queries, and complex text with special characters
- Visual difficulty selector with icons and descriptions
- Difficulty badge shows current mode
- Personal bests tracked separately for each difficulty level
- Difficulty preference saved to localStorage
- XP multipliers for higher difficulties (up to 2x for Expert)
- Updated statistics to show best scores per difficulty

### v2.4.0 - Export Feature Update
- Added export functionality for test results
- Export current result to JSON format
- Export full session history to JSON with summary statistics
- Export history to CSV for spreadsheet analysis
- Beautiful export buttons in results and history views
- Toast notifications for successful exports

### v2.3.0 - Dark/Light Theme Update
- Added beautiful dark mode with smooth transitions
- Added theme toggle button (☀️/🌙) in top-right corner
- Theme preference saved to localStorage
- Automatic detection of system preference on first visit
- Added 'T' keyboard shortcut to toggle theme
- All UI elements support both themes with CSS variables

### v2.2.0 - Sound Effects Update
- Added immersive sound effects system
- Audio feedback for each keystroke
- Error sound for incorrect characters
- Success chime on test completion
- Start test sound cue
- Toggle button to enable/disable sounds
- Volume and preference saved to localStorage
- Web Audio API powered (no external files needed)

### v2.1.0 - Statistics Update
- Added personal statistics tracking (Best WPM, Best Accuracy, Average WPM, Total Tests)
- Added session history with last 50 tests
- Added history modal with detailed test records
- Added new record celebration notifications
- Added "Clear Statistics" functionality with confirmation
- LocalStorage persistence for all statistics
- Responsive statistics grid layout

### v2.0.0 - Multiplayer Update
- Added multiplayer race mode
- Room creation with shareable codes
- Real-time progress synchronization
- Winner celebration with confetti
- Keyboard shortcuts
- Toast notifications
- Offline indicator
- Clean code structure (separated CSS/JS)
- Updated documentation

### v1.0.0 - Initial Release
- Solo typing test mode
- WPM and accuracy tracking
- Basic styling
- PWA support
