<<<<<<< HEAD
# 🌸 GoJapan — Japanese Learning Web Application

> A modern, aesthetic, community-inspired platform for learning Japanese — drawing inspiration from **Duolingo** and **Monkeytype**. Built as a full-stack web application for Special Subject 2 (SS2) Final Project.

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **Authentication** | Email/password + Google OAuth + Facebook OAuth login |
| あ **Kana** | Hiragana & Katakana learning with row-by-row selection |
| 語 **Vocabulary** | N5–N1 graded vocab organized into lesson units |
| 字 **Kanji** | N5–N1 kanji browser with onyomi/kunyomi readings |
| 🎮 **Training Engine** | 3 play modes: **Classic** (endless), **Blitz** (timed), **Gauntlet** (lives) |
| 📊 **Progress & Stats** | Session history, accuracy, streak calendar, achievements |
| 🏆 **Achievements** | 12 unlock-able achievements with XP and rarity system |
| 💬 **Feedback** | Community feedback board with upvote and image upload |
| 🎨 **Preferences** | Themes, wallpapers, fonts, cursor effects, BGM |
| 🤖 **AI Chatbot** | Intelligent assistant (Groq API) answering Japanese queries |
| 📱 **Responsive** | Fully mobile-responsive with hamburger sidebar drawer |

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** + **Vite** | UI framework & build tool |
| **Tailwind CSS v4** | Styling system |
| **React Router v7** | Client-side routing |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |
| **@react-oauth/google** | Google Sign-In |
| **react-facebook-login** | Facebook Sign-In |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** + **Express 5** | API server |
| **MySQL 8** via `mysql2` | Relational database |
| **bcrypt** | Password hashing |
| **jsonwebtoken** | Access + Refresh token auth |
| **google-auth-library** | Google token verification |
| **axios** | HTTP client for external APIs (Groq) |
| **dotenv** | Environment configuration |
| **nodemon** | Dev hot-reload |

---

## 🗂️ Project Structure

```
FinalProject_SS2/
├── README.md                    ← This file
├── ERD_v2.png                   ← Database Entity Relationship Diagram
│
├── frontend/                    ← React SPA (Vite)
│   ├── public/
│   └── src/
│       ├── App.jsx              ← Root router (separates training from main layout)
│       ├── index.css            ← Global styles, theme variables, responsive base
│       ├── main.jsx
│       ├── api/                 ← Axios API helper functions
│       │   ├── feedbackApi.js
│       │   └── learningApi.js
│       ├── assets/              ← Images and static assets
│       ├── components/
│       │   ├── common/          ← ModeCard
│       │   ├── effects/         ← GlobalEffects (cursor trail, click particles)
│       │   └── layout/
│       │       ├── MainLayout.jsx   ← Sidebar + main content wrapper
│       │       └── Sidebar.jsx      ← Desktop sidebar + mobile hamburger drawer
│       ├── context/
│       │   ├── AuthContext.jsx      ← JWT auth state (login, logout, token refresh)
│       │   └── PreferenceContext.jsx ← Theme, wallpaper, font, sound preferences
│       └── pages/
│           ├── Authentication/  ← LoginPage, SignUpPage
│           ├── Feedback/        ← FeedbackPage (submit + community board)
│           ├── Home/            ← Landing page with mode selection
│           ├── Kana/            ← Kana character selector + study
│           ├── Kanji/           ← Kanji browser by JLPT level
│           ├── Preferences/     ← Full preferences customization
│           ├── Progress/        ← Stats, Streak calendar, Achievements
│           ├── Training/        ← TrainingSetup, TrainingPlay, TrainingStats
│           └── Vocab/           ← Vocabulary browser by JLPT level
│
└── backend/                     ← Express API Server
    ├── README.md
    ├── data/                    ← Source JSON files for database seeding
    ├── src/
    │   ├── server.js            ← App entry point, table init, middleware setup
    │   ├── config/
    │   │   └── db.js            ← MySQL connection pool
    │   ├── controllers/         ← Business logic handlers
    │   │   ├── authController.js
    │   │   ├── contentController.js
    │   │   ├── feedbackController.js
    │   │   ├── progressController.js
    │   │   ├── questionController.js
    │   │   └── sessionController.js
    │   ├── middlewares/
    │   │   ├── authMiddleware.js    ← JWT token verification
    │   │   └── errorHandler.js     ← Global error handler
    │   ├── routes/
    │   │   ├── index.js            ← Mounts all route modules under /api
    │   │   ├── authRoutes.js
    │   │   ├── contentRoutes.js
    │   │   ├── feedbackRoutes.js
    │   │   ├── progressRoutes.js
    │   │   ├── questionRoutes.js
    │   │   └── sessionRoutes.js
    │   ├── seeders/             ← DB population scripts
    │   └── utils/               ← Shared utilities (asyncHandler, etc.)
    └── package.json
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- MySQL 8+ (local or cloud, e.g. [Railway](https://railway.app/))

---

### 1. Clone & Install

```bash
git clone <repo-url>
cd FinalProject_SS2
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=japanese_learning_db
DB_PORT=3306

# Use these for Railway / Cloud MySQL (with SSL)
# DATABASE_URL=mysql://user:pass@host:port/dbname

# JWT
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# OAuth & External APIs
GOOGLE_CLIENT_ID=your_google_client_id
GROQ_API_KEY=your_groq_api_key
```

Seed the database (optional but recommended):

```bash
npm run seed
```

Start the dev server:

```bash
npm run dev
# Server runs at http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

Start the frontend:

```bash
npm run dev
# App runs at http://localhost:5173
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register with email & password |
| `POST` | `/auth/login` | ❌ | Login, returns access + refresh tokens |
| `POST` | `/auth/refresh` | ❌ | Refresh access token |
| `POST` | `/auth/logout` | ❌ | Invalidate refresh token |
| `POST` | `/auth/google` | ❌ | Google OAuth login |
| `POST` | `/auth/facebook` | ❌ | Facebook OAuth login |
| `GET` | `/auth/profile` | ✅ | Get current user profile |
| `PUT` | `/auth/profile` | ✅ | Update user profile |

### Content & Chat — `/api`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/lessons` | Get all lessons (filterable by `?level=N5&type=Vocabulary`) |
| `GET` | `/lessons/:id` | Get single lesson by ID |
| `GET` | `/vocab` | Get vocabulary (filterable by `?lessonId=1`) |
| `GET` | `/kanji` | Get kanji (filterable by `?lessonId=1`) |
| `GET` | `/kana` | Get all kana characters |
| `GET` | `/chat/history` | Get user's chat history |
| `POST` | `/chat` | Send message to AI chatbot |

### Quiz & Questions — `/api/questions`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/questions` | List all quizzes |
| `GET` | `/questions/:quizId` | Get questions for a quiz |
| `POST` | `/questions` | Create a quiz |
| `PUT` | `/questions/:id` | Update a quiz |
| `DELETE` | `/questions/:id` | Delete a quiz |
| `POST` | `/questions/:quizId/items` | Add items to a quiz |

### Training Sessions — `/api/sessions`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sessions/create` | Start a new training session |
| `POST` | `/sessions/save-statistic` | Save session result & stats |

### Progress — `/api/progress`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/progress/user/:userId` | Get user's overall learning progress |
| `GET` | `/progress/history/:userId` | Get session history |
| `GET` | `/progress/login-history/:userId` | Get login/visit history for streak calendar |
| `GET` | `/progress/achievements` | Get all achievements |
| `GET` | `/progress/achievements/user/:userId` | Get user's unlocked achievements |
| `POST` | `/progress/achievements/unlock` | Unlock an achievement for a user |

### Feedback — `/api/feedback`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/feedback` | Get all community feedback posts |
| `POST` | `/feedback` | Submit a new feedback post |
| `PATCH` | `/feedback/:id/upvote` | Upvote a feedback post |

---

## 🎮 Training Modes

| Mode | Description |
|---|---|
| **Classic** | Endless practice, no time limit, no lives |
| **Blitz** | Time-limited per question (5s / 10s / 15s / 30s / 60s) |
| **Gauntlet — Normal** | 3 lives, +1 per correct, -1 per mistake |
| **Gauntlet — Hard** | 3 lives, -1 per mistake, no healing |
| **Gauntlet — Instant Death** | 0 mistakes allowed — 1 strike and you're out |

---

## 🎨 Themes Available

| Theme | Background | Accent |
|---|---|---|
| Light | `#f5f5f5` | Red |
| Dark (default) | `#111111` | Red |
| Sapphire Bloom | `#080d1c` | Blue |
| Monkeytype | `#323437` | Yellow |
| Temple Mist | `#0d1717` | Teal |
| Moonlit Bay | `#0f1626` | Blue |
| Emerald Forest | `#0d1b10` | Green |
| Shrine Stone | `#1a1818` | Coral |
| Sakura Pink | `#fce4ec` | Pink |
| Vending Glow | `#14051a` | Purple |

---

## 📱 Responsive Design

The app is fully responsive across all screen sizes:
- **Mobile (< 768px)**: Hamburger navigation drawer, stacked layouts, no-scroll quiz screen
- **Tablet (768px–1024px)**: Sidebar collapses appropriately
- **Desktop (> 1024px)**: Full sidebar, multi-column grids

---

## 👥 Contributors

Built with ❤️ as a Final Project for Special Subject 2 (SS2).
=======
# GoJapan
>>>>>>> 63aa07168edd87f73f00cd45f5d0cb5467610fb3
