# ARENA.ENG — Project Context

## Stack

**Client** (`client/`): Vue 3 + TypeScript, Vite 8, Phaser 4, Pinia 3, Vue Router 5, TailwindCSS 3, Supabase JS 2

**Server** (`server/`): Node.js, Express 5, TypeScript, Colyseus 0.17, Supabase JS 2 (service key), bcrypt, jsonwebtoken, nodemailer, dotenv

---

## Architecture

### Client

| Path | Role |
|---|---|
| `src/main.ts` | App bootstrap, Pinia, Router, Supabase auth listener + exchangeTokenAfterOAuth |
| `src/router/index.ts` | Vue Router; guards check `localStorage.arena_token` + Supabase session |
| `src/lib/supabase.ts` | Supabase client (anon key) |
| `src/stores/authStore.ts` | Auth state: user, profile, login/register/logout, exchangeTokenAfterOAuth. **fetchProfile calls `/api/user/profile` via arena JWT (not Supabase anon client) to bypass RLS.** |
| `src/stores/errorStore.ts` | Global toast notification store |
| `src/stores/gameStore.ts` | Game session state |
| `src/game/PhaserGame.ts` | Phaser 4 init (transparent, RESIZE mode) |
| `src/game/scenes/` | PreloadScene → BackgroundScene (placeholder debug text, remove before demo) |
| `src/components/ErrorNotification.vue` | Toast UI (top-right, type-colored) |
| `src/views/LoginView.vue` | Login + Register tabs; calls `POST /auth/login` via `authStore.loginWithEmail`; **"Remember Me" checkbox saves email to localStorage**; **email blur triggers `GET /auth/check-email` to detect Google-only accounts before submit** |
| `src/views/VerifyOTPView.vue` | 6-digit OTP input; calls `POST /auth/verify-otp` |
| `src/views/HomeView.vue` | Authenticated home / matchmaking stub; avatar clickable → /profile |
| `src/views/ProfileView.vue` | View + edit username/avatar; shows elo, rank, wins, losses, matches |
| `src/views/GameplayView.vue` | Full match UI: countdown timer, question display, letter slots, timeout overlay; **batch queue system** — fetches 20 questions at once via `GET /api/game/questions`, refetches when queue ≤ 5 remaining; calls `POST /api/game/session` on mount and `POST /api/game/timeout` on timer end |
| `src/views/ForgotPasswordView.vue` | Supabase `resetPasswordForEmail` |
| `src/views/ResetPasswordView.vue` | Supabase `updateUser` (handles `#access_token` hash) |
| `src/views/SignupView.vue` | DEAD CODE — delete before Sprint 2 |

### Server

| Path | Role |
|---|---|
| `src/index.ts` | Express + HTTP server on port 3000; mounts `/auth`, `/api/user`, `/api/game`; body limit 10mb; CORS configured for naenra.xyz, www.naenra.xyz, axonproject.onrender.com, localhost:5173 |
| `src/routes/authRoutes.ts` | All auth endpoints incl. `GET /auth/check-email` |
| `src/routes/userRoutes.ts` | Profile endpoints: GET/PATCH `/api/user/profile` |
| `src/routes/gameRoutes.ts` | Game endpoints: GET `/api/game/question`, GET `/api/game/questions`, POST `/api/game/session`, POST `/api/game/timeout` |
| `src/controllers/userController.ts` | getUserProfile, updateUserProfile; rank computed from elo |
| `src/controllers/gameController.ts` | getQuestion, getQuestions, createSession, timeoutSession |
| `src/middleware/authMiddleware.ts` | JWT Bearer verification; attaches `req.user` |
| `src/utils/jwt.ts` | `generateToken` / `verifyToken` (7d expiry) |
| `src/utils/otp.ts` | In-memory OTP store (10-min TTL) |
| `src/utils/mailer.ts` | nodemailer via Gmail SMTP |

---

## Auth Flow

```
Register → POST /auth/register
  → validate → check duplicate email in players table (catches Google-only accounts too)
  → pendingRegistrations Map (TTL 10min, auto-cleanup every 5min)
  → generateOTP → saveOTP → sendOTPEmail → 200 {email}

Verify OTP → POST /auth/verify-otp
  → verifyOTP → check pending expiry
  → supabase.auth.admin.createUser (plain pw, email_confirm:true)
  → upsert players row (elo:0, wins:0, losses:0, total_matches:0 explicitly set)
  → delete pending → generateToken → 201 {token, user}

Login → POST /auth/login
  → check if email is Google-only (returns clear error if so)
  → supabase.auth.signInWithPassword → fetch players profile → generateToken → 200 {token, user}
  → client: authStore.loginWithEmail stores token, calls fetchProfile() via arena JWT

Check Email → GET /auth/check-email?email=...
  → looks up players table → checks identities for provider type
  → returns { exists, provider: 'google' | 'email' | null }
  → used by LoginView on email blur to warn Google-only users before they submit

Google OAuth → client calls supabase.auth.signInWithOAuth (prompt: 'select_account') → redirect /home
  → onAuthStateChange SIGNED_IN fires → exchangeTokenAfterOAuth()
  → POST /auth/token → upsert players row if missing (elo:0 explicitly set, saves avatar_url from Google)
  → arena_token stored → fetchProfile() called

Password Reset → ForgotPasswordView → supabase.auth.resetPasswordForEmail (redirectTo /reset-password)
  → ResetPasswordView handles #access_token hash → supabase.auth.updateUser
```

Token storage: `localStorage.arena_token`

Remember Me storage: `localStorage.arena_remember_me` + `localStorage.arena_saved_email`

---

## Game Flow

```
Find Match → HomeView triggers navigation to /gameplay

Gameplay mount →
  POST /api/game/session → creates game_sessions row (status: 'active') → returns session_id
  GET  /api/game/questions → fetches batch of 20 random questions → stored in local queue
  First question popped from queue → 45s countdown starts

During match (infinite loop until timeout) →
  Player types answer → correct/wrong feedback (1s) → next question popped from queue
  When queue ≤ 5 remaining → GET /api/game/questions fetched in background (no latency)
  No limit on questions answered — gameplay continues until timer hits 0

Timer hits 0 → triggerTimeout()
  → gameState = 'timeout' (blocks keyboard input, shows TIME OUT overlay)
  → POST /api/game/timeout { session_id, score, questions_answered }
  → server locks row: status='timeout', ended_at=now(), score, questions_answered saved
  → duplicate calls rejected with 409 if session already ended
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Validate, check for conflicts (incl. Google-only), send OTP, store pending |
| POST | `/auth/verify-otp` | — | Verify OTP, create user+player row (explicit elo:0) |
| POST | `/auth/resend-otp` | — | Resend OTP |
| POST | `/auth/login` | — | Check not Google-only, email/password login |
| POST | `/auth/token` | — | Exchange Supabase token for arena JWT + upsert player row (explicit elo:0) |
| GET | `/auth/check-email` | — | Check if email exists and which provider (google/email) |
| GET | `/auth/me` | JWT | Return decoded user |
| GET | `/auth/profile` | JWT | Return players row (legacy) |
| GET | `/api/user/profile` | JWT | Return full profile: username, avatar_url, elo, rank, wins, losses, total_matches |
| PATCH | `/api/user/profile` | JWT | Update username and/or avatar_url |
| GET | `/api/game/question` | JWT | Return 1 random question (legacy, kept for compatibility) |
| GET | `/api/game/questions` | JWT | Return batch of 20 random questions, no duplicates within batch |
| POST | `/api/game/session` | JWT | Create active game session, returns session_id |
| POST | `/api/game/timeout` | JWT | Lock session on timeout; sets status='timeout', saves score |
| GET | `/health` | — | Server status |

---

## Database (Supabase/PostgreSQL)

Table `players` — actual schema:

| Column | Type | Notes |
|---|---|---|
| id | uuid | FK → auth.users.id |
| email | text | |
| username | text | |
| hashed_password | text | bcrypt hash; empty string for Google OAuth users |
| avatar_url | text | nullable |
| elo | int | default 1000 |
| wins | int | default 0 |
| losses | int | default 0 |
| total_matches | int | default 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Table `game_sessions` — actual schema:

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, gen_random_uuid() |
| player_id | uuid | FK → players.id |
| score | int | default 0 |
| questions_answered | int | default 0 |
| status | text | 'active' \| 'timeout'; default 'active' |
| started_at | timestamptz | default now() |
| ended_at | timestamptz | nullable; set on timeout |

Table `questions`:

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| question_text | text | Sentence with blank (______) |
| target_word | text | The answer word |
| hint | text | nullable; displayed above the question card |

RLS enabled. Server uses `SUPABASE_SERVICE_KEY` to bypass RLS for admin ops.

---

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

---

## Known Issues / Architecture Notes

- `pendingRegistrations` is in-memory — lost on server restart. Documented limitation for Sprint 1; move to Redis/Supabase in future sprint.
- No rate limiting on auth endpoints yet — Sprint 1 deferred.
- `BackgroundScene` has placeholder debug text — remove before any demo.
- `SignupView.vue` and `/signup` route are dead code — delete before Sprint 2.
- Avatar upload stores base64 in Supabase DB column — not ideal for large images. Move to Supabase Storage in future sprint.
- **Dual auth architecture**: custom JWT (`arena_token`) for all API calls + Supabase session for OAuth/password reset. `fetchProfile` in authStore now always uses the arena JWT to call `/api/user/profile`, avoiding Supabase RLS issues that previously caused elo to show as 0.
- `GET /auth/check-email` scans the players table then calls `admin.getUserById` — fine at small scale, but consider caching or a direct identity lookup before production scaling.
- **Batch question loading**: `GET /api/game/questions` shuffles all IDs in memory — fine for current question bank size. For 10k+ questions, switch to `ORDER BY RANDOM() LIMIT 20` or a cursor-based approach.

---

## Bug Fixes (Sprint 1 post)

### 1. Google + email same-account conflict
**Problem**: A user who signed up with Google could attempt to register again with the same email (or vice versa), causing confusing errors or silent failures.
**Fix**: `POST /auth/register` now checks the players table for the email and returns a clear error if the account is Google-only. `POST /auth/login` does the same check before attempting password auth.

### 2. ELO shows as 0 after account creation
**Problem**: `authStore.fetchProfile()` used the Supabase **anon client** which is blocked by RLS for the `players` table. Result: `profile = null`, elo fell back to `?? 0`.
**Fix**: `fetchProfile()` now calls `GET /api/user/profile` using the `arena_token` Bearer JWT. The server uses the service key to bypass RLS and returns the correct elo.

### 3. Google always re-prompts for account selection / no "Remember Me"
**Problem**: `signInWithOAuth` had no `prompt` param. Email login had no persistence mechanism.
**Fix**: Added `queryParams: { prompt: 'select_account' }` for Google. Added "Remember Me" checkbox in `LoginView.vue`.

### 4. Google-only accounts silently failing on email login (UX bug)
**Problem**: Users who registered via Google and tried to log in with email+password got a confusing error only after submitting the form.
**Fix**: `GET /auth/check-email` endpoint added. `LoginView.vue` calls it on email field blur. If the account is Google-only, a warning is shown immediately and the submit button is disabled, directing the user to the Google button.

### 5. game_sessions table not receiving data after match
**Problem**: `/api/game` routes were not mounted in `server/src/index.ts`, so all game API calls silently failed (client swallowed errors in try/catch).
**Fix**: Added `app.use('/api/game', gameRoutes)` to `index.ts`.

---

## Sprint Status

**Sprint 1 (complete)**:
- Auth foundation: register + OTP verify, email/password login, Google OAuth, password reset
- JWT middleware, players table upsert, error toast system
- HomeView with real username/avatar/elo from authStore
- ProfileView: view + edit username/avatar (click-to-upload), stats display
- Rank computed from elo server-side
- Fixed: logout redirect, pendingRegistrations TTL, Google OAuth player row creation
- Fixed (post): Google+email conflict detection, elo=0 bug, Remember Me for email login

**Sprint 2 (in progress)**:
- GameplayView: 45s match, letter-slot UI, correct/wrong feedback, TIME OUT overlay
- `POST /api/game/session` — creates active session on match start
- `POST /api/game/timeout` — locks session with score on timer end; rejects duplicate calls with 409
- `GET /api/game/question` — single random question from DB (legacy, kept for compatibility)
- `GET /api/game/questions` — batch of 20 random questions (US-05); client uses local queue, refetches at ≤5 remaining
- `GET /auth/check-email` — Google-only account detection on login email blur
- Questions table integrated; mock questions removed from client (fallback mocks remain for offline dev)
- Infinite question stream: no question limit per match, gameplay runs until timer hits 0

**Sprint 3 (next)**: Colyseus multiplayer rooms, matchmaking, real-time opponent sync, CoreSelectionView, ELO updates after match.

---

## Tailwind Color Palette

```js
hexred: '#E63946'
orange: '#FF7B00'
lightOrange: '#FFA62B'
blue: '#3B82F6'
lightBlue: '#60A5FA'
darkNavy: '#0F172A'
success: '#22C55E'
```

---

## CORS Origins (server)
- https://naenra.xyz
- https://www.naenra.xyz
- https://axonproject.onrender.com
- http://localhost:5173 (local dev)

## Deployment (Render)

**Server (Web Service):**
- Root Directory: `/server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- URL: https://axonproject-1.onrender.com
- Custom Domain: https://api.naenra.xyz

**Client (Static Site):**
- Root Directory: `/client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- URL: https://axonproject.onrender.com
- Custom Domain: https://naenra.xyz

**Environment Variables:**
- Client: VITE_SERVER_URL=https://axonprojsect-1.onrender.com
- Client: VITE_SITE_URL=https://naenra.xyz

## Agent Instructions
- Always use tools to read and write files directly
- Never describe changes without making them
- Never show JSON tool calls — execute them.