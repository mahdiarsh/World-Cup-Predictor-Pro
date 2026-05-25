# ⚽ World Cup Match Prediction Tournament Platform

An enterprise-ready, high-performance web platform designed for predicting FIFA World Cup match results, competing with other fans, tracking scores, and managing users/fixtures from a premium administrative cockpit.

---

## ✨ Features Highlights

### 📋 Interactive Fixtures Timeline (`/src/components/MatchesList.tsx`)
*   Full 32-team seed list with accurate matching flag emoji graphics.
*   Fixture stages including **Group matches**, **Round of 16**, **Quarter Finals**, **Semi Finals**, and the **Grand Final**.
*   Saves and edits prediction score entries.
*   **Kickoff Countdown Locking**: Automatically blocks registering or updating score estimations exactly **30 minutes prior to kickoff** as requested, printing clear warning banners.

### 📊 World Cup Leaderboard Standings (`/src/components/LeaderboardTable.tsx`)
*   Assigns live competitor ranking indices.
*   **Premium Spotlight Podiums**: Highlights the top 3 players with detailed champion and medal graphics.
*   Sort tiebreakers: Total Score ➔ Accurate Matches (+3) ➔ Correct Winners (+1) ➔ Played Matches efficiency ➔ ABC names.
*   Row-highlights the current validated session, with advanced name keyword filters and paginations.

### 👤 Profile Dashboard (`/src/components/UserProfile.tsx`)
*   Aggregates detailed statistics: Exact Match success percentage and general correct guess ratios.
*   Keeps a full chronological history of all predictions, complete with color-coded score result tags.

### 🛡️ Administrative Control Room (`/src/components/AdminPanel.tsx`)
*   **Competitors Management**: Register new players, Reset user passphrase credentials, Enable/Disable user access states, or delete accounts permanently.
*   **Fixture Curating**: Edit stadium venues, register new custom fixtures, modify kickoff times, record final match results, and calculate math points.
*   **Score Engine Console**: Instantly re-calculates all user statistics across prediction records within milliseconds using a single-click script.

---

## 🏗️ Technical Architecture

### ⚡ Frontend (Client-Side)
*   React 19 with Vite bundler.
*   Tailwind CSS styling utilizing our custom Emerald & Obsidian Sports palette.
*   Highly reactive responsive UI scaled specifically for touch targets on mobile devices.

### 🧠 Backend (Server-Side)
*   Node.js with Express platform.
*   JWT auth-tokens validated during individual REST operations.
*   Bcrypt-secured password hashing during user registration.
*   Filesystem-based persistent JSON Database with automatic schema auto-seeding.

---

## 🛠️ Quick Launch (Local Development)

### 1. Install Packages
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the server proxy running.

---

## 🔑 Default Test Accounts (Instant Review)

To simplify checking actions on the platform, we have added **direct fast-login shortcuts** next to the Login card. You can also type them manually:

1.  **Administrator Panel Access**:
    *   **Username**: `admin`
    *   **Password**: `admin`
2.  **Competitor Player Access**:
    *   **Username**: `messi10`
    *   **Password**: `messi10`
