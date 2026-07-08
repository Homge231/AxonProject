# ARENA.ENG – Agent Context Guide

> **For AI agents only.** This file is the authoritative technical reference for the entire codebase.
> Read this before making any changes. Keep it updated after every significant change.

---

## Stack

**Client** (`client/`): Vue 3 + TypeScript, Vite 8, Phaser 4, Pinia 3, Vue Router 5, TailwindCSS 3, Supabase JS 2

**Server** (`server/`): Node.js, Express 5, TypeScript, Colyseus 0.17, Supabase JS 2 (service key), bcrypt, jsonwebtoken, nodemailer, dotenv

---

## Architecture Overview

```
client/src/
  views/          # Full-page Vue views (GameplayView, CoreSelectionView, etc.)
  stores/         # Pinia stores: authStore, gameStore, errorStore
  components/     # Reusable UI: Avatar, ErrorNotification, game/PhaserBackground
  game/           # Phaser init + scenes
  game/cores/     # ← [NEW] Frontend core registry (Strategy Pattern)
    BaseCore.ts   # CoreModule interface + PENDING_UUID sentinel
    registry.ts   # All core UI configs; getCoreModule(uuid) lookup
  router/         # Vue Router with auth guards

server/src/
  controllers/    # gameController.ts, userController.ts
  routes/         # authRoutes, userRoutes, gameRoutes
  middleware/     # authMiddleware (JWT)
  utils/          # jwt.ts, otp.ts, mailer.ts
  cores/          # ← [NEW] Backend scoring strategy system (Strategy Pattern)
    BaseCore.ts   # Abstract class + ScoringContext / ScoringResult types
    NoCoreStrategy.ts
    ComboCoreStrategy.ts
    OracleCoreStrategy.ts
    SpeedsterCoreStrategy.ts
    index.ts      # Registry + runScoring() entry point
```

---

## Core System — Strategy Pattern (MOST IMPORTANT)

### Why it exists
Every "Support Core" (game power-up) has unique scoring logic and unique visual effects. Instead of growing `if/else` chains in `gameController.ts` and `GameplayView.vue`, each core is encapsulated in its own class (BE) / config object (FE).

### Adding a new core — the ONLY files you touch

**Backend:**
1. Create `server/src/cores/YourCoreStrategy.ts` — extend `BaseCore`, implement `calculateCorrect(ctx)`
2. Register it in `server/src/cores/index.ts` — one line: `'your core name': new YourCoreStrategy()`

**Frontend:**
1. Add one entry to `client/src/game/cores/registry.ts` keyed by the lowercase name.

`gameController.ts` and `GameplayView.vue` **never need to be touched** for new cores.

### Backend — ScoringContext interface (`server/src/cores/BaseCore.ts`)

```ts
interface ScoringContext {
  timeTaken: number        // ms since question appeared (from FE payload)
  totalTime: number        // always MATCH_DURATION_MS = 60_000
  combo: number            // current answer streak
  wrongPenalty: number     // Levenshtein-based penalty (pre-calculated)
  oracleRevealLevel: number // 0–3 hint levels used
  flatBuff: number         // cores.flat_buff from DB
  multiplierBuff: number   // cores.multiplier_buff from DB
}
```

### Backend — Registered strategies (`server/src/cores/index.ts`)

| Registry key | Strategy class | Scoring behaviour |
|---|---|---|
| `'no core'` | `NoCoreStrategy` | `floor((100 + flat_buff) × multiplier_buff)` |
| `'combo core'` | `ComboCoreStrategy` | `floor((100 + comboBonus + flat_buff) × multiplier_buff)` |
| `'oracle core'` | `OracleCoreStrategy` | Same as No Core minus oracle hint penalty |
| `'speedster'` | `SpeedsterCoreStrategy` | `100 + max(0, floor((1 − timeTaken/8000) × 150))` |
| `'mission core'`| `MissionCoreStrategy` | Flat +500 bonus upon completing 5 correct answers in a row |
| `'aegis shield'`| `AegisCoreStrategy` | Tracks correct answers (max 3 stacks). Deducts stack instead of points on miss. |
| `'pandora''s box'` | `PandoraCoreStrategy` | Meta-core (shifts frontend active core). Acts as NoCore if answered before shift. |

Registry lookup: `getCoreStrategy(core.name)` — **case-insensitive, trimmed**. Unknown names fall back to `NoCoreStrategy` with a `console.warn`.

### Frontend — CoreModule interface (`client/src/game/cores/BaseCore.ts`)

```ts
interface CoreModule {
  id: string               // Supabase UUID — use PENDING_UUID if not in DB yet
  name: string             // Must match cores.name in DB
  timerColor: string       // Tailwind class for timer colour
  timerClass: string       // CSS animation class for timer digit
  timerIconClass: string   // CSS animation class for timer icon
  popupType: 'correct' | 'speedster'  // Which floating popup to show
  showWindOverlay?: boolean // Render wind-streak effect around letter slots
}
```

### Frontend — Registered cores (`client/src/game/cores/registry.ts`)

Keyed by the core `name` (lowercase). UUIDs are no longer hardcoded on the frontend.

| Key | Core name | Special effects |
|---|---|---|
| `'no core'` | No Core | None |
| `'combo core'` | Combo Core | None |
| `'oracle core'` | Oracle Core | None (Oracle uses its own template block) |
| `'speedster'` | Speedster | Cyan timer glow, wind-streak overlay, "+N FAST!" popup |
| `'pandora\'s box'` | Pandora's Box | Purple pulse timer, shifts core every 25s, "PANDORA SHIFTS TO X" text |
| `'aegis shield'` | Aegis Shield | Cyan timer, glowing 3-orb stack tracker UI, "BLOCKED!" popup on miss |

### How GameplayView.vue uses the registry

```ts
const activeCoreModule = computed(() => getCoreModule(gameStore.activeCoreId))
// Timer uses: activeCoreModule.timerColor / .timerClass / .timerIconClass
// Wind overlay: v-if="activeCoreModule.showWindOverlay && gameState === 'playing'"
// Popup: if (data.correct && activeCoreModule.popupType === 'speedster') → spawnPointPopup('speedster')
```

---

## Scoring Engine (gameController.ts)

The old `calculateScore()` monolith is gone. Scoring is now:

```ts
const { pointsDelta, breakdown } = runScoring(isCorrect, core.name, {
  timeTaken,          // from req.body.time_taken
  totalTime: MATCH_DURATION_MS,
  combo,
  wrongPenalty,
  oracleRevealLevel,
  flatBuff: core.flat_buff,
  multiplierBuff: core.multiplier_buff,
})
```

### Wrong-answer penalty (shared across all cores)

| Situation | Formula | Clamp |
|---|---|---|
| Accuracy ≥ 80% (typo) | `max(1, distance × 2)` | No cap |
| Accuracy < 80% or skip | `distance × 10` | 10–50 pts |

Accuracy uses Levenshtein edit distance. Empty answer = full skip = worst case.

### Speedster formula (US-17.1)

```
speedBonus  = max(0, floor( (1 − timeTaken / 8000) × 150 ))
pointsDelta = 100 + speedBonus            -- ignores flat_buff and multiplier_buff
```

Answer in 1s → ~231 pts. Answer in 3s → ~193 pts. Answer in 8s+ → 100 pts.

---

## Client-side time_taken tracking

`questionStartTime` is reset to `Date.now()` inside `loadQuestion()` every time a new question appears. Both `checkAnswer()` and `skipQuestion()` compute:

```ts
const timeTaken = Date.now() - questionStartTime.value
// ...included in every submit-answer POST body
```

---

## Visual Effects — Speedster Core (US-17.2 + US-17.3)

| Effect | CSS class / behaviour |
|---|---|
| Timer glow | `.speedster-timer-glow` — pulsing cyan `text-shadow`, 0.8s cycle |
| Timer icon glow | `.speedster-timer-icon` — same pulse + `drop-shadow` filter |
| Wind streaks | `.speedster-wind-container` + `.wind-streak.ws1`–`.ws6` — 6 horizontal streaks sweeping left→right at staggered speeds (0.65–0.95s) |
| Letter slot glow | `.speedster-slots-glow` — cyan `drop-shadow` on the letter row |
| "+N FAST!" popup | `type: 'speedster'` in `PointPopup`; `.speedster-fast-text` — shimmer gradient, 1.8s upward burst |

---

## File Architecture: Client Views

| File | Role |
|---|---|
| `GameplayView.vue` | Full match UI: timer, question, letter slots, score, popups, core effects, session lifecycle |
| `CoreSelectionView.vue` | Core selection screen shown before each match |
| `HomeView.vue` | Authenticated home / matchmaking |
| `ProfileView.vue` | View + edit username/avatar; elo, rank, stats |
| `LoginView.vue` | Login + Register tabs; email blur triggers check-email |
| `VerifyOTPView.vue` | 6-digit OTP input |
| `ForgotPasswordView.vue` | `supabase.auth.resetPasswordForEmail` |
| `ResetPasswordView.vue` | Handles `#access_token` hash → `supabase.auth.updateUser` |

## File Architecture: Server Controllers

| File | Role |
|---|---|
| `gameController.ts` | getQuestion, getQuestions, getCores, createSession, submitAnswer, timeoutSession, abandonSession |
| `userController.ts` | getUserProfile, updateUserProfile; rank computed from elo |

---

## Auth Flow

```
Register → POST /auth/register
  → validate → check duplicate in players table (catches Google-only accounts)
  → pendingRegistrations Map (TTL 10min) → sendOTPEmail → 200 {email}

Verify OTP → POST /auth/verify-otp
  → supabase.auth.admin.createUser → upsert players row → generateToken → 201

Login → POST /auth/login
  → check not Google-only → supabase.auth.signInWithPassword → generateToken → 200

Google OAuth → supabase.auth.signInWithOAuth → onAuthStateChange SIGNED_IN
  → POST /auth/token → upsert players row → arena_token stored

Password Reset → resetPasswordForEmail → redirectTo /reset-password → updateUser
```

Token: `localStorage.arena_token` (7-day JWT)

---

## Game Flow

```
CoreSelectionView → player picks a core → activeCoreId stored in gameStore

GameplayView.onMounted →
  POST /api/game/session { active_core_id }   → session_id, theme, active_core returned
  GET  /api/game/questions                    → batch of 20 questions pre-fetched
  loadQuestion() → questionStartTime = Date.now() → 60s countdown starts

Each answer →
  checkAnswer() or skipQuestion()
  → timeTaken = Date.now() - questionStartTime
  → POST /api/game/submit-answer {
      session_id, question_id, answer,
      current_combo, active_core_id,
      oracle_reveal_level, time_taken      ← always sent now
    }
  → BE runs anti-cheat (core mismatch → 403)
  → BE calls runScoring(isCorrect, core.name, ctx)
  → Score updated from authoritative BE response
  → Correct + Speedster → "+N FAST!" popup; otherwise standard popup

Timer hits 0 →
  POST /api/game/timeout → status='timeout', score locked
```

---

## Database Schema

### `cores`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Seeded stable UUIDs |
| name | text | Matched by BE/FE registries (case-insensitive) |
| description | text | nullable |
| flat_buff | int | Default 0 |
| multiplier_buff | float | Default 1.0 |
| tier | int | Default 1. (1: Base, 2: Upgrade, 3: Final) |
| upgrades_to | uuid | Self-referencing FK for evolution tree |

### `game_sessions`
| Column | Notes |
|---|---|
| active_core_id | uuid FK → cores.id; locked at creation; validated on every submit-answer |
| score | int; updated after each answer |
| status | 'active' \| 'timeout' \| 'abandoned' |

### `game_session_answers`
| Column | Notes |
|---|---|
| points_delta | int; positive = earned, negative = penalty |

### `players`
| Column | Notes |
|---|---|
| elo | int; default 1000 (updated post-match — Sprint 3) |
| hashed_password | empty string for Google OAuth users |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ✗ | Validate, OTP, pending registration |
| POST | `/auth/verify-otp` | ✗ | Create user + player row |
| POST | `/auth/resend-otp` | ✗ | Resend OTP |
| POST | `/auth/login` | ✗ | Email/password login |
| POST | `/auth/token` | ✗ | Exchange Supabase token (Google OAuth) |
| GET | `/auth/check-email` | ✗ | Provider detection on email blur |
| GET | `/api/user/profile` | JWT | Full profile with rank |
| PATCH | `/api/user/profile` | JWT | Update username / avatar |
| GET | `/api/game/questions` | JWT | Batch of 20 random questions |
| GET | `/api/game/cores` | JWT | List all cores |
| POST | `/api/game/session` | JWT | Create session with active_core_id |
| POST | `/api/game/submit-answer` | JWT | Score answer via strategy registry |
| POST | `/api/game/timeout` | JWT | Lock session on timer end |
| POST | `/api/game/abandon` | JWT | Abandon session |
| GET | `/health` | ✗ | Server status |

---

## Tailwind Color Palette

```js
hexred:     '#E63946'
orange:     '#FF7B00'
lightOrange:'#FFA62B'
blue:       '#3B82F6'
lightBlue:  '#60A5FA'
darkNavy:   '#0F172A'
success:    '#22C55E'
```

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

## Sprint Status

**Sprint 1 ✅** — Auth: register+OTP, email/password login, Google OAuth, password reset, JWT middleware, ProfileView

**Sprint 2 ✅** — Gameplay: 60s match, letter slots, score system, batch question loading, session lifecycle, anti-cheat

**Sprint 2 — Scoring Engine Upgrade ✅** — Core system, Levenshtein penalty, multiplier/flat_buff formula, `submit-answer` v2

**Sprint 2 — US-17 Speedster Core ✅** (fully wired — Supabase UUID `00000000-0000-0000-0000-000000000007`):
  - `SpeedsterCoreStrategy` — time-based scoring
  - `time_taken` tracked FE-side, sent in every answer payload
  - Wind-streak visual effects + cyan timer glow
  - "+N FAST!" floating popup
  - **Core Strategy Pattern refactor** — BE + FE both use registry/parent-child architecture

**Sprint 3 (in progress)**:
  - ELO updates after match end ✅ (Formula: expected_score = 500 + ELO/2, change = 0.05 * (score - expected_score), wins/losses stats saved)
  - Core upgrade anti-cheat validation ✅ (enforces initial core must be T1, and upgrades must be T+1 and same family)
  - Colyseus multiplayer rooms + matchmaking (planned)
  - Real-time opponent sync (planned)
  - **Clean up / Delete test "Skip to Core Selection" button** (added in settings menu of `GameplayView.vue`) before production

---

## CORS Origins

- https://naenra.xyz
- https://www.naenra.xyz
- https://axonproject.onrender.com
- http://localhost:5173

## Deployment (Render)

**Server:** Root `server/` · Build `npm install && npm run build` · Start `npm start` · `https://api.naenra.xyz`

**Client:** Root `client/` · Build `npm install && npm run build` · Publish `dist` · `https://naenra.xyz`

---

## Agent Rules

- Always use tools to read files before editing them
- Never describe changes — make them
- After adding a new core, update this file's core registry tables
- `PENDING_UUID` in `registry.ts` has been replaced — Speedster UUID is `00000000-0000-0000-0000-000000000007`
- Do not add `if/else` branches to `gameController.ts` for new cores — use the strategy registry
- Do not add hardcoded core UUIDs to `GameplayView.vue` — use `activeCoreModule` from the registry