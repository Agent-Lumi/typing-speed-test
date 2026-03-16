# ⌨️ Typing Speed Test

A beautiful, interactive typing speed test application that measures your Words Per Minute (WPM), accuracy, and typing performance in real-time.

## 🚀 Live Demo

**Try it now:** [https://agent-lumi.github.io/typing-speed-test/](https://agent-lumi.github.io/typing-speed-test/)

## ✨ Features

- **Real-time WPM Calculation** - See your typing speed update as you type
- **Accuracy Tracking** - Monitor your typing accuracy percentage
- **Live Timer** - 60-second countdown timer for each test
- **Visual Feedback** - Color-coded characters show correct (green) and incorrect (red) keystrokes
- **Dynamic Quote Generation** - Fresh quotes for every test session
- **Responsive Design** - Works beautifully on desktop and mobile devices
- **Modern UI** - Clean, gradient-themed interface with smooth animations
- **No Installation Required** - Runs directly in your browser

## 🎯 How to Use

1. **Open the app** in your browser (visit the live demo link above)
2. **Click the text input area** to begin
3. **Start typing** the displayed quote as quickly and accurately as possible
4. **Watch your stats** update in real-time:
   - **WPM** - Words per minute based on your typing speed
   - **Accuracy** - Percentage of correctly typed characters
   - **Time** - Countdown from 60 seconds
5. **Complete the test** or let the timer run out
6. **Click "New Test"** to try again with a fresh quote

## 🏆 Scoring Explanation

### WPM (Words Per Minute)
- Calculated based on the number of characters typed correctly
- Standard formula: `(characters / 5) / (time in minutes)`
- Only correctly typed characters count toward your score

### Accuracy
- Percentage of characters typed correctly
- Formula: `(correct characters / total characters typed) × 100`
- Aim for high accuracy alongside speed!

### Timer
- Each test lasts **60 seconds**
- Timer starts when you begin typing
- Test automatically ends when time runs out

## 🛠️ Technologies Used

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with Flexbox/Grid
- **JavaScript** - Real-time typing logic and calculations
- **Google Fonts** - Inter and JetBrains Mono typography

## 📱 Browser Support

Works in all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Local Development

To run locally:

```bash
# Clone the repository
git clone https://github.com/Agent-Lumi/typing-speed-test.git

# Navigate to the directory
cd typing-speed-test

# Open in your browser
open index.html
```

Or simply serve with a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve
```

Then visit `http://localhost:8000` in your browser.

## 🤝 Contributing

Feel free to open issues or submit pull requests to improve the typing test!

## 📄 License

Open source - feel free to use and modify!

---

**Created with 💡 by Lumi for [@shalkith](https://github.com/shalkith)**
