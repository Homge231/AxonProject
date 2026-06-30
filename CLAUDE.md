# ARENA.ENG – Project Context

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
| `src/views/GameplayView.vue` | Full match UI: countdown timer, question display, letter slots, timeout overlay; **batch queue system** → fetches 20 questions at once via `GET /api/game/questions`, refetches when queue ≤ 5 remaining; calls `POST /api/game/session` (with `active_core_id`) on mount and `POST /api/game/timeout` on timer end; **calls `POST /api/game/submit-answer` immediately on each answer** with `{ current_combo, active_core_id }` → updates score state from BE response; **floating "+N PTS" / "-N PTS" animation** anchored to letter-slot coordinates; **score progress bar** with smooth CSS transition |
| `src/views/CoreSelectionView.vue` | Core selection screen before match start (Sprint 3) |
| `src/views/ForgotPasswordView.vue` | Supabase `resetPasswordForEmail` |
| `src/views/ResetPasswordView.vue` | Supabase `updateUser` (handles `#access_token` hash) |

### Server

| Path | Role |
|---|---|
| `src/index.ts` | Express + HTTP server on port 3000; mounts `/auth`, `/api/user`, `/api/game`; body limit 10mb; CORS configured for naenra.xyz, www.naenra.xyz, axonproject.onrender.com, localhost:5173 |
| `src/routes/authRoutes.ts` | All auth endpoints incl. `GET /auth/check-email` |
| `src/routes/userRoutes.ts` | Profile endpoints: GET/PATCH `/api/user/profile` |
| `src/routes/gameRoutes.ts` | Game endpoints: GET `/api/game/question`, GET `/api/game/questions`, GET `/api/game/cores`, POST `/api/game/session`, POST `/api/game/submit-answer`, POST `/api/game/timeout`, POST `/api/game/abandon` |
| `src/controllers/userController.ts` | getUserProfile, updateUserProfile; rank computed from elo |
| `src/controllers/gameController.ts` | getQuestion, getQuestions, getCores, createSession, submitAnswer (secure scoring engine), timeoutSession, abandonSession |
| `src/middleware/authMiddleware.ts` | JWT Bearer verification; attaches `req.user` |
| `src/utils/jwt.ts` | `generateToken` / `verifyToken` (7d expiry) |
| `src/utils/otp.ts` | In-memory OTP store (10-min TTL) |
| `src/utils/mailer.ts` | Resend API email sender |

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
Core Selection (Sprint 3 UI, currently defaults to "No Core") →
  GET /api/game/cores → list of available cores shown to player
  Player picks a core → active_core_id stored in client state

Find Match → HomeView triggers navigation to /gameplay

Gameplay mount →
  POST /api/game/session { active_core_id } → creates game_sessions row (status: 'active', active_core_id stored)
                                             → returns session_id, theme, avatar_url, active_core
  GET  /api/game/questions → fetches batch of 20 random questions → stored in local queue
  First question popped from queue → 60s countdown starts

During match (infinite loop until timeout) →
  Player types answer → correct/wrong feedback (1s) → next question popped from queue
  When queue ≤ 5 remaining → GET /api/game/questions fetched in background (no latency)
  No limit on questions answered → gameplay continues until timer hits 0

On each answer submission →
  POST /api/game/submit-answer { session_id, question_id, answer, time_taken, current_combo, active_core_id }
  ① Validate session ownership and 'active' status
  ② ANTI-CHEAT: verify submitted active_core_id === game_sessions.active_core_id → 403 on mismatch
  ③ Fetch core row (flat_buff, multiplier_buff)
  ④ Evaluate answer correctness
  ⑤ Calculate score: correct  → floor(((100 + combo_bonus) + flat_buff) * multiplier_buff)
                     wrong    → -(5–25 penalty based on letter diff, no core buffs)
  ⑥ Insert into game_session_answers (unique per session+question, 409 on duplicate)
  ⑦ Update game_sessions.score and questions_answered
  ⑧ Return { status, correct, points_earned, points_deducted, current_total_score, questions_answered, breakdown }
  → FE updates score from authoritative BE value
  → Floating "+N PTS" or "-N PTS" animates at letter-slot coordinates
  → Score progress bar transitions smoothly

Timer hits 0 → triggerTimeout()
  → gameState = 'timeout' (blocks keyboard input, shows TIME OUT overlay)
  → POST /api/game/timeout { session_id }
  → server locks row: status='timeout', ended_at=now()
  → duplicate calls rejected with 409 if session already ended
```

---

## Scoring Formula

```
CORRECT ANSWER:
  combo_bonus  = min(current_combo × 10, 100)           -- capped at +100
  raw_score    = (100 + combo_bonus) + core.flat_buff
  points_delta = floor(raw_score × core.multiplier_buff)

WRONG ANSWER:
  wrong_chars  = count of mismatched or missing letters
  penalty      = clamp(wrong_chars × 5, min=5, max=25)
  points_delta = −penalty                               -- no core buffs on wrong answers

SESSION TOTAL:
  new_total_score = max(0, previous_score + points_delta)
```

### Starter Cores

| Core | flat_buff | multiplier_buff | Effect |
|---|---|---|---|
| No Core | 0 | 1.0 | Standard play |
| Speed Core | +15 | 1.0 | +15 pts every correct word |
| Power Core | 0 | 1.5× | 50% more points per word |
| Balanced Core | +10 | 1.25× | Combined flat and multiplier buff |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ✗ | Validate, check for conflicts (incl. Google-only), send OTP, store pending |
| POST | `/auth/verify-otp` | ✗ | Verify OTP, create user+player row (explicit elo:0) |
| POST | `/auth/resend-otp` | ✗ | Resend OTP |
| POST | `/auth/login` | ✗ | Check not Google-only, email/password login |
| POST | `/auth/token` | ✗ | Exchange Supabase token for arena JWT + upsert player row (explicit elo:0) |
| GET | `/auth/check-email` | ✗ | Check if email exists and which provider (google/email) |
| GET | `/auth/me` | JWT | Return decoded user |
| GET | `/auth/profile` | JWT | Return players row (legacy) |
| GET | `/api/user/profile` | JWT | Return full profile: username, avatar_url, elo, rank, wins, losses, total_matches |
| PATCH | `/api/user/profile` | JWT | Update username and/or avatar_url |
| GET | `/api/game/question` | JWT | Return 1 random question (legacy) |
| GET | `/api/game/questions` | JWT | Return batch of 20 random questions, no duplicates within batch |
| GET | `/api/game/cores` | JWT | Return all available Support Cores |
| POST | `/api/game/session` | JWT | Create active game session with `active_core_id`; returns session_id, theme, active_core |
| POST | `/api/game/submit-answer` | JWT | Secure scoring endpoint — validates core, computes score formula, updates DB; returns `{ status, correct, points_earned, points_deducted, current_total_score, questions_answered, breakdown }` |
| POST | `/api/game/timeout` | JWT | Lock session on timeout; sets status='timeout', saves score |
| POST | `/api/game/abandon` | JWT | Mark session abandoned when player quits mid-match |
| GET | `/health` | ✗ | Server status |

---

## Database (Supabase/PostgreSQL)

Table `players`:

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

Table `cores` *(new)*:

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK (seeded UUIDs for stable references) |
| name | text | Display name |
| description | text | nullable |
| flat_buff | int | Flat pts added before multiplier (default 0) |
| multiplier_buff | float | Final score multiplier (default 1.0) |
| created_at | timestamptz | |

Table `game_sessions`:

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, gen_random_uuid() |
| player_id | uuid | FK → players.id |
| active_core_id | uuid | FK → cores.id; set at session creation; used for anti-cheat validation *(new)* |
| score | int | default 0 |
| questions_answered | int | default 0 |
| status | text | 'active' \| 'timeout' \| 'abandoned'; default 'active' |
| started_at | timestamptz | default now() |
| ended_at | timestamptz | nullable; set on timeout or abandon |

Table `game_session_answers`:

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK → game_sessions.id |
| question_id | uuid | FK → questions.id |
| answer | text | Player's typed answer |
| correct | bool | Whether answer matched target_word |
| points_delta | int | Positive (earned) or negative (penalty) |

Table `questions`:

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| question_text | text | Sentence with blank (______) |
| target_word | text | The answer word |
| hint | text | nullable; displayed above the question card |

RLS enabled. Server uses `SUPABASE_SERVICE_KEY` to bypass RLS for admin ops.
`cores` table has read-all RLS policy so clients can list cores via server proxy.

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
RESEND_API_KEY=
MAIL_FROM=
```

---

## Known Issues / Architecture Notes

- `pendingRegistrations` is in-memory → lost on server restart. Move to Redis/Supabase in a future sprint.
- No rate limiting on auth endpoints yet → Sprint 1 deferred.
- `BackgroundScene` has placeholder debug text → remove before any demo.
- Avatar upload stores base64 in Supabase DB column → move to Supabase Storage in a future sprint.
- **Dual auth architecture**: custom JWT (`arena_token`) for all API calls + Supabase session for OAuth/password reset. `fetchProfile` in authStore now always uses the arena JWT to call `/api/user/profile`, avoiding Supabase RLS issues.
- **Batch question loading**: shuffles all IDs in memory → fine at current scale. For 10k+ questions, switch to `ORDER BY RANDOM() LIMIT 20`.
- **Score progress bar soft cap**: bar treats 2000 pts as "full width" for visual purposes; actual score continues to accumulate beyond that.
- **Core system**: `active_core_id` is locked at session creation and validated on every `submit-answer` call. Mismatches return 403 and are logged server-side for audit.

---

## Sprint Status

**Sprint 1 (complete)**:
- Auth foundation: register + OTP verify, email/password login, Google OAuth, password reset
- JWT middleware, players table upsert, error toast system
- HomeView with real username/avatar/elo from authStore
- ProfileView: view + edit username/avatar (click-to-upload), stats display
- Rank computed from elo server-side
- Fixed (post): Google+email conflict detection, elo=0 bug, Remember Me for email login

**Sprint 2 (complete)**:
- GameplayView: 60s match, letter-slot UI, correct/wrong feedback, TIME OUT overlay
- `POST /api/game/session` → creates active session on match start
- `POST /api/game/timeout` → locks session with score on timer end; rejects duplicate calls with 409
- `POST /api/game/submit-answer` (v1) → validates answer, basic scoring, returns totals
- `POST /api/game/abandon` → marks session abandoned when player quits
- `GET /api/game/questions` → batch of 20 random questions; client refetches at ≤5 remaining
- `GET /auth/check-email` → Google-only account detection on login email blur
- Infinite question stream; questions table integrated
- **Score API integration**: FE state updated from authoritative BE response
- **Floating score popup**: "+N PTS" / "-N PTS" rises and fades at letter-slot coordinates
- **Score progress bar**: smooth CSS-transition bar; colour shifts by score tier

**Sprint 2 (current — scoring engine upgrade)**:
- **Secure scoring endpoint** `POST /api/game/submit-answer` (v2):
  - Receives `{ session_id, question_id, answer, time_taken, current_combo, active_core_id }`
  - Anti-cheat: validates `active_core_id` matches `game_sessions.active_core_id` → 403 on mismatch
  - Score formula: `floor(((100 + combo_bonus) + flat_buff) × multiplier_buff)` for correct; penalty-only for wrong
  - Returns `{ status, correct, points_earned, points_deducted, current_total_score, questions_answered, breakdown }`
- **Support Core system**: `cores` table with 4 starter cores; `active_core_id` stored on session creation
- **`GET /api/game/cores`**: lists all available cores for UI (Sprint 3 CoreSelectionView)
- **`POST /api/game/session`** updated to accept and validate `active_core_id`
- **DB migration** `sql/migration_scoring_system.sql` adds `cores` table + `game_sessions.active_core_id`

**Sprint 3 (next)**: Colyseus multiplayer rooms, matchmaking, real-time opponent sync, CoreSelectionView wire-up to actual core selection UI, ELO updates after match.

---

## Tailwind Color Palette

```js
hexred: '#E63946'
orange: '#FF7B00's
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

## Agent Instructions
- Always use tools to read and write files directly
- Never describe changes without making them
- Never show JSON tool calls — execute them.