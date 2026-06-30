# ARENA.ENG — Naenra

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
    views/       # Vue views (Login, Home, Profile, Gameplay, etc.)
    stores/      # Pinia stores (auth, error, game)
    router/      # Vue Router with auth guards
    components/  # Reusable components
server/
  src/
    routes/      # Auth, user, and game routes
    controllers/ # User profile and game controllers
    middleware/  # JWT auth middleware
    utils/       # JWT, OTP, mailer utilities
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
MAIL_USER=
MAIL_PASS=
```

## Gameplay

Each match is **60 seconds**. Players receive an infinite stream of fill-in-the-blank questions and earn points for every correct answer. Typing the correct word immediately loads the next question — no limit on questions per match.

**Scoring:** `100 points per correct answer.`

**Question loading:** The client pre-fetches a batch of 20 questions on match start. When the queue drops to 5 or fewer, a new batch is fetched in the background — ensuring zero latency between questions.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register with email + OTP verification |
| POST | `/auth/verify-otp` | — | Verify OTP and create account |
| POST | `/auth/resend-otp` | — | Resend OTP |
| POST | `/auth/login` | — | Email/password login |
| POST | `/auth/token` | — | Exchange Supabase token for arena JWT (Google OAuth) |
| GET | `/auth/check-email` | — | Check provider for an email address |
| GET | `/api/user/profile` | JWT | Get full player profile |
| PATCH | `/api/user/profile` | JWT | Update username and/or avatar |
| GET | `/api/game/question` | JWT | Single random question (legacy) |
| GET | `/api/game/questions` | JWT | Batch of 20 random questions |
| POST | `/api/game/session` | JWT | Create active game session |
| POST | `/api/game/timeout` | JWT | Lock session on timeout with final score |
| GET | `/health` | — | Server status |

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

**Server ENV on Render:**s
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
MAIL_USER=
MAIL_PASS=
```

**CORS Origins (server):**
- https://naenra.xyz
- https://www.naenra.xyz
- https://axonproject.onrender.com
- http://localhost:5173

**Supabase:**
- Site URL: https://naenra.xyz
- Redirect URLs: https://naenra.xyz/**, https://www.naenra.xyz/**