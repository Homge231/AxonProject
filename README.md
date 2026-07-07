# ARENA.ENG – Naenra

A web-based typing esports arena built with Vue 3 + TypeScript frontend and an Express backend.

## Overview

**Naenra** is a competitive typing game where players race against a 90-second timer, answering fill-in-the-blank vocabulary questions. Before each match, players choose a **Support Core** — a power-up that changes how their score is calculated for the entire session.

- `client/` — Vue 3 SPA (Vite, Phaser, Pinia, Tailwind CSS)
- `server/` — Express API with Supabase (auth, DB, storage)

**Live:** https://naenra.xyz · **API:** https://api.naenra.xyz

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Vue 3, TypeScript, Vite 8, Phaser 4, Pinia 3, Vue Router 5, Tailwind CSS 3, Supabase JS 2 |
| Backend | Node.js, Express 5, TypeScript, Supabase JS 2, bcrypt, jsonwebtoken, nodemailer |
| Database | Supabase (PostgreSQL) |
| Deployment | Render (server + client static) |

---

## Project Structure

```
client/src/
  views/              # Full-page components (Gameplay, CoreSelection, Login, Profile…)
  stores/             # Pinia: authStore, gameStore, errorStore
  components/         # Avatar, ErrorNotification, game/PhaserBackground
  game/               # Phaser init + scenes
  game/cores/         # Frontend core registry (Strategy Pattern)
    BaseCore.ts       # CoreModule interface
    registry.ts       # All core UI configs — THE only file to edit for a new core (FE)
  router/             # Vue Router with auth guards

server/src/
  controllers/        # gameController.ts, userController.ts
  routes/             # authRoutes, userRoutes, gameRoutes
  middleware/         # JWT auth middleware
  utils/              # jwt.ts, otp.ts, mailer.ts
  cores/              # Backend scoring strategy system (Strategy Pattern)
    BaseCore.ts       # Abstract class + ScoringContext / ScoringResult types
    NoCoreStrategy.ts
    ComboCoreStrategy.ts
    OracleCoreStrategy.ts
    SpeedsterCoreStrategy.ts
    index.ts          # Registry + runScoring() — THE only file to edit for a new core (BE)
```

---

## Run Locally

```bash
# Terminal 1 — backend
cd server && npm install && npm run dev

# Terminal 2 — frontend
cd client && npm install && npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3000/health

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

## Gameplay

Each match is **90 seconds**. Players receive an infinite stream of fill-in-the-blank questions. Correct answers earn points; wrong answers lose points based on how many letters were wrong (Levenshtein distance). A **Support Core** chosen before the match changes how points are calculated for the entire session.

### Support Core System

Cores are the central mechanic that differentiates player strategies. Each core is a self-contained module — adding a new core requires creating one file on the backend and adding one entry on the frontend.

| Core | Scoring behaviour |
|---|---|
| **No Core** | `floor( (100 + flat_buff) × multiplier_buff )` |
| **Combo Core** | Same as No Core + up to +100 bonus for answer streaks |
| **Oracle Core** | Lets you reveal letter hints at −10/−30/−60 point cost per level |
| **Speedster** | `100 + max(0, floor( (1 − timeTaken/8s) × 150 ))` — faster = more points |
| **Mission Core**| Answer 5 correctly in a row for a flat bonus of +500 points |
| **Pandora's Box**| Periodically shapeshifts into another core entirely during the match! |
| **Aegis Shield**| Answering correctly builds a shield (max 3) that deflects wrong answer penalties |

At the end of Round 1 and Round 2, players can upgrade their Base Core to Tier 2 and Tier 3 evolutions (e.g. Speedster → Time Warp → Chronobreak) via a Core Upgrade interface.

The chosen core is **locked at session creation** and validated on every answer submission (anti-cheat: mismatches return 403).

### Wrong-Answer Penalties

| Scenario | Formula |
|---|---|
| Close miss (≥ 80% similarity) | `max(1, wrongLetters × 2)` pts deducted |
| Wrong / skip (< 80% similarity) | `wrongLetters × 10` pts, clamped 10–50 |

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ✗ | Register → send OTP |
| POST | `/auth/verify-otp` | ✗ | Verify OTP → create account |
| POST | `/auth/resend-otp` | ✗ | Resend OTP |
| POST | `/auth/login` | ✗ | Email/password login |
| POST | `/auth/token` | ✗ | Google OAuth → arena JWT |
| GET | `/auth/check-email` | ✗ | Detect provider for an email |
| GET | `/api/user/profile` | JWT | Full profile: elo, rank, stats |
| PATCH | `/api/user/profile` | JWT | Update username / avatar |
| GET | `/api/game/questions` | JWT | Batch of 20 randomised questions |
| GET | `/api/game/cores` | JWT | List all available cores |
| POST | `/api/game/session` | JWT | Create session; lock core |
| POST | `/api/game/submit-answer` | JWT | Score an answer; returns breakdown |
| POST | `/api/game/timeout` | JWT | Finalise session on timer end |
| POST | `/api/game/abandon` | JWT | Abandon mid-match |
| GET | `/health` | ✗ | Server health check |

### submit-answer payload

```json
{
  "session_id": "...",
  "question_id": "...",
  "answer": "discovery",
  "current_combo": 3,
  "active_core_id": "...",
  "oracle_reveal_level": 0,
  "time_taken": 4231
}
```

`time_taken` is always sent (ms elapsed since the question appeared). It is used by the Speedster core.

---

## Adding a New Core

### Backend — 2 steps

**1. Create `server/src/cores/YourCoreStrategy.ts`:**

```ts
import { BaseCore, ScoringContext, ScoringResult, BASE_POINTS } from './BaseCore'

export class YourCoreStrategy extends BaseCore {
  readonly coreName = 'your core name'   // must match cores.name in DB

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    const total = /* your formula */ - oraclePenalty
    return {
      pointsDelta: total,
      breakdown: { base: BASE_POINTS, combo_bonus: 0, flat_buff: 0, multiplier_buff: 1, oracle_penalty: oraclePenalty, penalty: 0, mission_completed: 0 }
    }
  }
}
```

**2. Register in `server/src/cores/index.ts`:**

```ts
import { YourCoreStrategy } from './YourCoreStrategy'

const CORE_REGISTRY = {
  // ... existing entries
  'your core name': new YourCoreStrategy(),
}
```

### Frontend — 1 step

Add one entry to `client/src/game/cores/registry.ts` (keyed by name):

```ts
'your core name': {
  id: '<supabase-uuid>',
  name: 'Your Core Name',
  timerColor: 'text-purple-400',
  timerClass: '',
  timerIconClass: '',
  popupType: 'correct',
  // showWindOverlay: true   ← optional, adds wind-streak effect
},
```

**That's it. No other files need to change.**

---

## Database (Supabase)

### `cores`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Stable seeded UUIDs |
| name | text | Matched by BE/FE strategy registries |
| description | text | Shown on CoreSelectionView |
| flat_buff | int | Added before multiplier (default 0) |
| multiplier_buff | float | Score multiplier (default 1.0) |
| tier | int | 1: Base, 2: Upgrade, 3: Final |
| upgrades_to | uuid | Self-referencing FK for evolution tree |

### `game_sessions`
| Column | Notes |
|---|---|
| active_core_id | FK → cores.id; locked at session start |
| score | Updated after each answer |
| status | `'active'` \| `'timeout'` \| `'abandoned'` |

### `game_session_answers`
Stores every submitted answer with `points_delta` for audit.

### `questions`
| Column | Notes |
|---|---|
| question_text | Sentence with `______` blank |
| target_word | Correct answer (never sent to client directly) |
| hint | Shown above question card |

---

## Deployment (Render)

**Server — Web Service:**
- Root: `server/` · Build: `npm install && npm run build` · Start: `npm start`
- URL: https://api.naenra.xyz

**Client — Static Site:**
- Root: `client/` · Build: `npm install && npm run build` · Publish: `dist`
- URL: https://naenra.xyz

**CORS origins:** naenra.xyz, www.naenra.xyz, axonproject.onrender.com, localhost:5173

---

## Known Pending Items

- **Speedster core** — Supabase UUID `00000000-0000-0000-0000-000000000007`. Registry fully wired.
- `pendingRegistrations` is in-memory — lost on server restart. Move to Redis/Supabase in a future sprint.
- **Avatar storage** — Uploads to Supabase Storage bucket `avatars`.
- ELO updates after match are not yet wired (Sprint 3).
- Colyseus multiplayer rooms not yet active (Sprint 3).