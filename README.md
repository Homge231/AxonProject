# ARENA.ENG – Naenra

A web-based typing esports arena built with Vue 3 + TypeScript frontend and an Express/Colyseus backend.

## Overview

Naenra is a multiplayer typing game where players compete in real-time ranked matches.
- `client/`: Vue 3 app using Vite, Phaser, Pinia, and Tailwind CSS
- `server/`: Express-based backend with Colyseus support for real-time multiplayer

## Tech Stack

**Frontend:** Vue 3, TypeScript, Vite 8, Phaser 4, Pinia 3, Vue Router 5, Tailwind CSS 3, Supabase JS 2

**Backend:** Node.js, Express 5, TypeScript, Colyseus 0.17, Supabase JS 2, bcrypt, jsonwebtoken, nodemailer, dotenv

## Project Structure

```
client/
  src/
    game/        # Phaser game initialization and scenes
    views/       # Vue views (Login, Home, Profile, Gameplay, CoreSelection, etc.)
    stores/      # Pinia stores (auth, error, game)
    router/      # Vue Router with auth guards
    components/  # Reusable components
server/
  src/
    routes/      # Auth, user, and game routes
    controllers/ # User profile and game controllers
    middleware/  # JWT auth middleware
    utils/       # JWT, OTP, mailer utilities
sql/
  migration_scoring_system.sql   # cores table + game_sessions.active_core_id
```

## Run Locally

```bash
# Client
cd client
npm install
npm run dev

# Server (new terminal)
cd server
npm install
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3000/health

## Database Migration

Run `sql/migration_scoring_system.sql` in your Supabase SQL editor to add the `cores` table and `active_core_id` column on `game_sessions`:

```sql
-- Creates cores table, seeds 4 starter cores, adds active_core_id FK to game_sessions
\i sql/migration_scoring_system.sql
```

## Environment Variables

**`client/.env`**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SERVER_URL=http://localhost:3000
VITE_SITE_URL=http://localhost:5173
```

**`server/.env`**
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
RESEND_API_KEY=
MAIL_FROM=
```

## Gameplay

Each match is **60 seconds**. Players receive an infinite stream of fill-in-the-blank questions. Correct answers earn points; wrong answers incur a small penalty. A **Support Core** chosen before the match applies permanent buffs throughout the session.

### Scoring Formula

```
CORRECT:  floor( ((100 + combo_bonus) + flat_buff) × multiplier_buff )
WRONG:    −(5–25 pts based on letter mismatch count; no core buffs)
```

**Combo bonus:** `current_combo × 10`, capped at +100 pts per answer.

### Support Cores

| Core | Flat Buff | Multiplier | Effect |
|---|---|---|---|
| No Core | +0 | ×1.0 | Standard play |
| Speed Core | +15 | ×1.0 | +15 pts every correct word |
| Power Core | +0 | ×1.5 | 50% more points per word |
| Balanced Core | +10 | ×1.25 | Flat and multiplier combined |

The core is locked at session creation. Every `submit-answer` call validates that the client-submitted `active_core_id` matches the session's stored value — mismatches are rejected with **403 Forbidden** (anti-cheat).

**Live score feedback:**
- Score state updated from authoritative BE response after each answer.
- Floating **"+N PTS"** (green) or **"-N PTS"** (red) animates upward from the letter-slot area.
- **Score progress bar** fills and transitions smoothly with each update; colour shifts by score tier.

**Question loading:** Client pre-fetches 20 questions on match start; refetches in the background when queue drops to ≤5.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ✗ | Register with email + OTP verification |
| POST | `/auth/verify-otp` | ✗ | Verify OTP and create account |
| POST | `/auth/resend-otp` | ✗ | Resend OTP |
| POST | `/auth/login` | ✗ | Email/password login |
| POST | `/auth/token` | ✗ | Exchange Supabase token for arena JWT (Google OAuth) |
| GET | `/auth/check-email` | ✗ | Check provider for an email address |
| GET | `/api/user/profile` | JWT | Get full player profile |
| PATCH | `/api/user/profile` | JWT | Update username and/or avatar |
| GET | `/api/game/question` | JWT | Single random question (legacy) |
| GET | `/api/game/questions` | JWT | Batch of 20 random questions |
| GET | `/api/game/cores` | JWT | List all available Support Cores |
| POST | `/api/game/session` | JWT | Create session with `active_core_id`; returns session_id, theme, active_core |
| POST | `/api/game/submit-answer` | JWT | Secure scoring: validates core, computes formula, updates DB; returns `{ status, correct, points_earned, points_deducted, current_total_score, questions_answered, breakdown }` |
| POST | `/api/game/timeout` | JWT | Lock session on timeout with final score |
| POST | `/api/game/abandon` | JWT | Abandon session when player quits mid-match |
| GET | `/health` | ✗ | Server status |

## Deployment (Render)

**Server — Web Service:**
- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- URL: https://axonproject-1.onrender.com
- Custom Domain: https://api.naenra.xyz

**Client — Static Site:**
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- URL: https://axonproject.onrender.com
- Custom Domain: https://naenra.xyz

**Client ENV on Render:**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SERVER_URL=https://axonproject-1.onrender.com
VITE_SITE_URL=https://naenra.xyz
```

**Server ENV on Render:**
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
RESEND_API_KEY=
MAIL_FROM=
```

**CORS Origins (server):**
- https://naenra.xyz
- https://www.naenra.xyz
- https://axonproject.onrender.com
- http://localhost:5173

**Supabase:**
- Site URL: https://naenra.xyz
- Redirect URLs: https://naenra.xyz/**, https://www.naenra.xyz/**