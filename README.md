# MTG Companion Toolbox 🃏⚔️🛡️

A modern, fast, and visually rich **Progressive Web App (PWA)** designed live for multiplayer Magic: The Gathering Commander and drafting sessions. Designed specifically for tablet, desktop, and mobile tabletop play.

👉 **Live Demo:** [https://AldoIs.github.io/mtgmanagment/](https://AldoIs.github.io/mtgmanagment/)

---

## 🚀 Key Modules & Features

### 1. ⚡ MTG Stack Visualizer
A real-time tracker simulating the LIFO (Last In First Out) rules of Magic: The Gathering (Rule 405).
- **LIFO Visual Stack**: Spells, activated/triggered abilities, and effects stack vertically, with the latest element highlighted as `TOP (Resolves Next)`.
- **Scryfall Autocomplete Search**: Start typing any card name; the system debounces query requests and autocomplete lists cards.
- **Card Preview Portal**: Hovering or clicking a card thumbnail opens a large modal card overlay centered on the viewport (using React Portals to guarantee zero overflow clipping).
- **Effect Type Tags**: Color-coded badges and icons to designate effects as a *Spell* 🪄, *Trigger* ⚡, or *Ability* ✨.
- **Text Notes**: Append custom notes (e.g., "Habilidad 1", "Target: Commander", "Copy of spell") underneath the card name.
- **Audio Feedback**: Synthesized browser audio signals for stack adds, resolves, and clears (can be toggled in the header).

### 2. ⚔️ Booster Draft Match Organizer
A helper for managing tournament brackets, player pairings, and live scoreboards during booster draft events.
- **Player Registry**: Add/remove players (4 to 8 players capacity).
- **Round-Robin Matchmaking**: Automatically schedules matchups using the Circle Method. Injects a virtual `BYE` player if player count is odd.
- **Live Match Cards**: Record match wins (`2-0`, `2-1`, `1-2`, `0-2`) for each pairing.
- **Automatic Standings Board**: Computes standings in real-time, sorting by Wins, then Losses, then Game Differentials. Highlights the current leader with a star.
- **Round Timer**: A standard 50-minute round countdown timer with alert signals.

### 3. 🏆 Commander League System
A scoring dashboard to track multi-game multiplayer leagues (3-6 players per game) and generate global power rankings.
- **Elimination Order Log**: Record games in real-time by clicking who gets eliminated and by whom, or marking concessions/self-eliminations.
- **Skill & Variety Scoring**:
  - *Base Points*: 1st place gets 5 pts, 2nd gets 3 pts, 3rd gets 2 pts, others get 1 pt.
  - *Bonuses*: `+1` per elimination, `+1` for eliminating the top-ranked leader, and `+1` for variety (using a different commander than their previous game).
  - *Penalties*: `-1` for conceding early.
- **Power Leaderboards & Trends**: Computes dynamic **Power Scores** and tracks rank trends (rank changes since previous games).
- **Player Profile Modal**: Review in-depth statistics, point breakdowns, commander play frequency, and a timeline of recent game logs.

### 4. ❤️ Commander Life Tracker
A Lifetap-inspired multiplayer life counter and commander damage grid designed for 2–6 player games.
- **Full-Viewport Grid**: Fits 100% inside the viewport height without page scrolling. Features a dynamic grid columns adjuster (forces a symmetrical 2x2 grid for 4 players).
- **Card Backgrounds**: Searches and loads commander artwork from Scryfall to render as blurred, dimmed backgrounds behind player scores.
- **Linked Commander Damage Matrix**: Track commander damage received from each opponent. Incrementing damage automatically subtracts points from the player's life.
- **Settings Drawer**: A floating settings button slides out an overlay menu on all screen sizes to configure players, adjust layout order, and trigger resets.

---

## 🛠️ Tech Stack & Configurations

- **Framework**: React (Functional Components & Hooks)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) + LocalStorage State Persistence middleware
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Source**: [Scryfall Public REST API](https://scryfall.com/docs/api)
- **CI/CD Deployment**: GitHub Actions workflow (`JamesIves/github-pages-deploy-action`)

---

## 📦 How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone git@github.com:AldoIs/mtgmanagment.git
   cd mtgmanagment
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite dev server**:
   ```bash
   npm run dev
   ```

4. **Compile production bundle**:
   ```bash
   npm run build
   ```
