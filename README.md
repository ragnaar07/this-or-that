# THIS ⚡ THAT

A fast-paced, mobile-first, live two-player **"This or That"** synchronization game.

Two friends join the same room on their phones. Both receive the exact same pair of choices simultaneously. Each secretly locks in their answer. Once both answer — or the 10-second timer runs out — the game triggers an explosive full-screen reveal: **MATCH!** (Mint Green) or **NO MATCH** (Red), then seamlessly auto-advances to the next round.

---

## ⚡ Features

* **Instant 2-Player Rooms:** 4-character room codes (e.g. `X7QK`) with ticket-stub lobby.
* **Synchronized 10-Second Countdown:** Server-authoritative timer synchronized across both devices.
* **Host-Authoritative Sync:** Single source of truth for room state, round transitions, and scoring.
* **Private & Secure Answers:** Player answers are written to isolated player keys — no peeking before reveal.
* **Early Reveal Trigger:** Instant reveal as soon as both players lock in their choices.
* **Full-Screen Emotional Reveals:**
  * 🟩 **MATCH!** (Mint Green flash)
  * 🟥 **NO MATCH** (Red flash)
* **Live AI Question Generation:** Dynamically creates punchy, fun choices via Google Gemini AI / OpenAI.
* **30+ Offline Fallback Questions:** Zero interruption even if AI APIs are unreachable or offline.
* **Tactile & Responsive Design:** High-contrast retro-game-show aesthetic, thumb-friendly mobile UI.
* **Zero Waiting:** Fully automatic flow (`Join → Question → Pick → Reveal → Next Round`).

---

## 🏗️ Architecture

```
[ Player 1 Device ] ──┐
                      ├─► [ Frontend (React + Vite) ]
[ Player 2 Device ] ──┘          │ (HTTP Polling ~700ms)
                                 ▼
                     [ Backend (Node.js + Express + TS) ]
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
            [ In-Memory Store ]     [ AI Question Service ]
            (Rooms & Answers)       (Google Gemini / OpenAI / Fallback)
```

---

## 📁 Repository Structure

```text
this-or-that/
├── frontend/                  # Independently deployable React frontend
│   ├── src/
│   │   ├── components/        # Brand, Countdown, OptionButton, RevealScreen, etc.
│   │   ├── config/            # Centralized API configuration (api.ts)
│   │   ├── hooks/             # usePolling, useCountdown hooks
│   │   ├── pages/             # Home, Lobby, Game screens
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript game types
│   │   ├── App.tsx            # Screen state machine
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Design system & animations
│   ├── public/                # Static assets & favicon
│   ├── index.html             # HTML shell with mobile meta tags
│   ├── vite.config.ts         # Vite build & proxy config
│   ├── tsconfig.json          # TypeScript config
│   └── .env.example           # Frontend environment variables template
│
├── backend/                   # Independently deployable Express API backend
│   ├── src/
│   │   ├── types.ts           # Shared data models
│   │   ├── store.ts           # In-memory room and answer storage
│   │   ├── questionService.ts # Gemini / OpenAI / Fallback generator
│   │   ├── fallbackQuestions.ts # 30+ built-in question pairs
│   │   ├── roomCode.ts        # 4-character code generator
│   │   └── index.ts           # Express REST API, CORS & health routes
│   ├── tsconfig.json          # TypeScript compiler configuration
│   └── .env.example           # Backend environment variables template
│
├── .gitignore                 # Production-ready git ignore
├── package.json               # Root workspace scripts
└── README.md                  # Project documentation
```

---

## 🚀 Local Development

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### 1. Clone the repository
```bash
git clone https://github.com/ragnaar07/this-or-that.git
cd this-or-that
```

### 2. Install all dependencies
```bash
# Using root workspace script:
npm run install:all

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGIN=http://localhost:5173
```
*(Copy from `backend/.env.example`)*

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000
```
*(Copy from `frontend/.env.example`)*

### 4. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Running on http://localhost:5000 (Health check: http://localhost:5000/health)
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env.example`)
| Variable | Required | Description | Default |
|---|---|---|---|
| `PORT` | No | Port on which the Express server listens | `5000` |
| `GEMINI_API_KEY` | Recommended | Google Gemini API key for dynamic AI questions | Built-in fallback |
| `OPENAI_API_KEY` | Optional | OpenAI API key (alternative to Gemini) | — |
| `FRONTEND_URL` | Production | Allowed origin for CORS in production | `http://localhost:5173` |
| `ALLOWED_ORIGIN` | Optional | Additional allowed CORS origin | — |

> 🔒 **Security Notice:** AI credentials, database URLs, and server secrets must **NEVER** be committed to Git or exposed in the frontend.

### Frontend (`frontend/.env.example`)
| Variable | Required | Description | Default |
|---|---|---|---|
| `VITE_API_URL` | Production | Full URL of the deployed backend server | `http://localhost:5000` |

---

## 🚢 Production Deployment

The frontend and backend are decoupled and can be deployed independently.

### Option A: Deploy Backend (e.g. Render, Railway, Fly.io)
1. **Root directory:** `backend`
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. **Environment Variables:**
   * `PORT`: Set automatically by platform (or `5000`)
   * `GEMINI_API_KEY`: Your Google AI Studio API key
   * `FRONTEND_URL`: `https://your-frontend-domain.vercel.app`
5. **Health Check Path:** `/health`

### Option B: Deploy Frontend (e.g. Vercel, Netlify, Cloudflare Pages)
1. **Root directory:** `frontend`
2. **Framework Preset:** Vite
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variables:**
   * `VITE_API_URL`: `https://your-backend-domain.onrender.com`

---

## 📱 Testing with Two Devices (Same WiFi)

1. Find your machine's local IP address:
   * **Windows:** `ipconfig` (Look for `IPv4 Address`, e.g., `192.168.1.15`)
   * **Mac/Linux:** `ifconfig` or `ip a`
2. Update `backend/.env`:
   ```env
   ALLOWED_ORIGIN=*
   ```
3. Update `frontend/.env`:
   ```env
   VITE_API_URL=http://192.168.1.15:5000
   ```
4. Start frontend exposed to local network:
   ```bash
   cd frontend
   npx vite --host
   ```
5. **Device 1 (Host):** Open `http://192.168.1.15:5173` → Enter name → **CREATE A ROOM** → note 4-character code.
6. **Device 2 (Guest):** Open `http://192.168.1.15:5173` → Enter name & code → **JOIN ROOM**.
7. Both screens will instantly transition into the live game!

---

## ⚠️ Known V1 Limitations

1. **In-Memory Room State:** Active game rooms are stored in the backend server memory. Restarting the server clears active rooms (can be backed by Redis / Supabase in V2).
2. **Host Disconnection:** If the room creator closes their browser entirely, the room session terminates (host migration can be added in V2).
3. **Page Refresh:** Refreshing during an active round currently returns to home (session persistence via localStorage can be added in V2).

---

## 📄 License
MIT © 2026 THIS ⚡ THAT
