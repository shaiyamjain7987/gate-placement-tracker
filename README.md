# 🎯 GATE & Placement Preparation Tracker

A high-performance, dark/light-themed web application designed for students preparing for **GATE (CS/IT/Engg)**, **Campus Placement Drives**, and **Lifelong Polymath Mastery**. Features LeetCode-style contribution heatmaps, daily 0.5–3.0 hour slider logging, scheduled desktop reminders, formula & mistake logs, a dedicated brain supplement tracker, and a new **Life Knowledge Hub** for exploring neuroscience, geopolitics, psychology, communication, relationships, breathwork, and game theory.

---

## 🚀 Key Features

### 1. 🟩 LeetCode-Style Activity Heatmaps
- **Global Overview Matrix**: View your daily study contribution grid across the last 3 months, 6 months, or full year.
- **Per-Subject Heatmaps**: Expand any subject card to inspect its standalone 16-week contribution streak.
- **5 Intensity Levels**: 0h, 0.5–1h, 1–1.5h, 1.5–2.5h, 2.5–3h+.
- **Hover Tooltip**: Displays date, total study hours, subject breakdown, and session notes.

### 2. 🎚️ 0.5 to 3.0 Hours Rating Slider & 1-Click "Done Today"
- Dedicated slider ranging precisely from **0.5 hours (30 mins)** to **3.0 hours (Max Rating)** with 0.5h step increments.
- Visual rating badges: ⚡ Quick Review (0.5h), 🎯 Solid Session (1h), 🚀 Deep Work (1.5h), 🔥 Intense Practice (2h), 🏆 Heavy Grind (2.5h), 👑 Master Marathon (3h).
- Inline quick-slider directly on every subject card + Full Log modal with topic checklists.

### 3. 🧭 Life & New Fields Hub (Multidisciplinary Polymath Learning)
Broaden your worldview beyond engineering with dedicated tracking for 7 core life fields:
- **🧠 Neuroscience**: Brain neuroplasticity, dopamine baseline & reward circuits, sleep architecture & cognitive endurance.
- **🌍 Geopolitics**: Maritime chokepoints, semiconductor supply chains, energy transition & multipolar balance of power.
- **💭 Psychology**: Behavioral economics, cognitive biases, System 1/2 thinking & mental resilience.
- **🗣️ Communication Skills**: High-stakes dialogue, the Minto pyramid principle, tactical empathy, active listening & storytelling.
- **❤️ Relationship Knowledge**: Adult attachment theory, nonviolent communication (NVC), Gottman 4 horsemen & boundaries.
- **🫁 Breathwork & Pranayama**: Autonomic nervous system regulation, physiological sigh, box breathing & CO2 tolerance.
  - *Includes an interactive visual **Box Breathing Guide (4-4-4-4)** with real-time breathing circle animation!*
- **♟️ Game Theory**: Mathematical strategic interaction, Nash equilibrium, Prisoner's dilemma & positive-sum cooperation.
- **"Add Field" Button**: Add custom fields (e.g. Stoicism, Biohacking, Philosophy, Astronomy) with custom emojis, colors, core topics, and book recommendations!
- **Dedicated Curiosity LeetCode Heatmap**: Tracks your 15m to 120m reading & podcast deep-dive sessions.

### 4. 💊 Brain & Study Supplement Tracker
- Heatmap tracking daily vitamin & supplement consistency.
- Pre-populated with your exact daily essentials:
  - **Vitamin B12** (1500 mcg)
  - **Vitamin D3** (2000–60000 IU)
  - **Calcium** (500 mg)
  - **Magnesium** (250–400 mg Glycinate)
  - **Zinc** (25–50 mg)
  - **B-Plex Forte** (B-Complex + Vitamin C)
  - **Iron** (100 mg elemental)
- Water hydration counter (interactive `+` / `-` glass logger) and sleep hours slider.

### 5. ⏰ Scheduled Reminders & Desktop Alerts
- **Browser Web Notifications API**: Receive native OS alerts even when on other tabs.
- **Zero-Dependency Audio Chime**: Synthetic harmonic chime powered by the Web Audio API.
- Configurable alarms & deep focus Pomodoro timer.

### 6. 📝 Prep Notes, Formulas & Mistake Log
- Organize notes by **Formula & Shortcuts**, **Mistake Log / Traps**, **Core Concepts**, and **Placement Questions**.
- Searchable by keywords, tags, or subject filter with 1-click clipboard copying.

### 7. ☀️🌙 Dark & Light Mode Toggle
- Instant theme toggle in the top navbar with persistent `localStorage` preference.

### 8. 🔐 Google Authentication (OAuth 2.0 & Identity Services)
- **Official Google Sign-In**: Powered by Google Identity Services (GSI) for seamless 1-click Google OAuth login.
- **Account Profile & Status**: Displays Google avatar, full name, email, and active sync badge in the top navbar.
- **Quick Demo Sign-In**: Instant preview mode to test the authenticated experience without needing cloud credentials.
- **Flexible OAuth Configuration**: Provide your `VITE_GOOGLE_CLIENT_ID` via `.env` or paste it directly in the in-app Google OAuth Settings modal.

### 9. 💾 Local Persistence & Data Portability
- Automatic `localStorage` saving.
- **Export Backup (JSON)** & **Import Backup (JSON)**.
- Clean start with 0 hours, with optional "Load Demo Data (Preview)" anytime.

---

## 🏃 Running Locally

```bash
# Navigate to project directory
cd "C:\Users\tasuj\.gemini\antigravity\scratch\gate-placement-tracker"

# Install dependencies (already installed)
npm install

# Start Vite development server
npm run dev
```

Open your browser at **`http://localhost:5173/`**.
