# AGENTS.md — AI Agent Handoff Document

> **Read this first.** This document explains the full context of the Naenra project for any incoming AI agent. It covers what has been built, the design decisions made, what is still pending, and the rules you must follow when making changes.

---

## What is this project?

**Naenra (ARENA.ENG)** is a competitive web-based typing game. Players race against a 60-second timer answering fill-in-the-blank vocabulary questions. Before each match, they pick a **Support Core** — a power-up that changes how their score is calculated.

- **Frontend:** Vue 3 + TypeScript + Pinia + Tailwind CSS (`client/`)
- **Backend:** Node.js + Express + TypeScript + Supabase (`server/`)
- **Live:** https://naenra.xyz · **API:** https://api.naenra.xyz

---

## Current State of the Codebase

### What is fully implemented ✅

| Feature | Location |
|---|---|
| Email/password auth + OTP verification | `authRoutes.ts`, `LoginView.vue`, `VerifyOTPView.vue` |
| Google OAuth | `main.ts`, `authStore.ts`, `/auth/token` |
| Password reset | `ForgotPasswordView.vue`, `ResetPasswordView.vue` |
| Player profile (elo, rank, stats) | `ProfileView.vue`, `userController.ts` |
| 60-second match with infinite question stream | `GameplayView.vue`, `gameController.ts` |
| Letter-slot UI with correct/wrong feedback | `GameplayView.vue` |
| Floating +N PTS / -N PTS score popup | `GameplayView.vue` |
| Batch question pre-fetching (20 at a time) | `gameController.ts getQuestions()` |
| Session lifecycle (create / timeout / abandon) | `gameController.ts` |
| **Core selection screen** | `CoreSelectionView.vue` |
| **Anti-cheat core validation** | `submitAnswer()` in `gameController.ts` |
| **Levenshtein-based penalty** (typo vs wrong) | `getWrongAnswerPenalty()` |
| **Core Strategy Pattern — Backend** | `server/src/cores/` |
| **Core Strategy Pattern — Frontend** | `client/src/game/cores/` |
| **Oracle Core** (progressive letter hints) | `OracleCoreStrategy.ts`, `GameplayView.vue` oracle block |
| **Combo Core** (streak bonus) | `ComboCoreStrategy.ts` |
| **Speedster Core — Backend scoring** | `SpeedsterCoreStrategy.ts` |
| **Speedster Core — Frontend effects** | Wind streaks, cyan timer glow, "+N FAST!" popup |
| **`time_taken` sent on every answer** | `checkAnswer()`, `skipQuestion()` in `GameplayView.vue` |

### What is NOT yet done ❌

| Item | Notes |
|---|---|
| Speedster Supabase row | ✅ Created. UUID: `00000000-0000-0000-0000-000000000007`. Registry fully wired. |
| ELO updates after match | Planned Sprint 4 |
| Colyseus multiplayer | Planned Sprint 4 |
| Real-time opponent sync | Planned Sprint 4 |
| Rate limiting on auth endpoints | Deferred |
| OTP store persistence | Currently in-memory, lost on restart |
| Avatar storage | Currently base64 in DB column, should move to Supabase Storage |

---

## The Most Important Architectural Decision: Core Strategy Pattern

### The problem it solves

Before the refactor, every core's logic lived inside one big `calculateScore()` function in `gameController.ts`, and every core's visual behaviour lived as `if (isComboCore)` / `if (isOracleCore)` chains in `GameplayView.vue`. Every new core required editing two central files.

### The solution

Each core is now **self-contained**. The system uses the **Strategy Pattern**:

```
BaseCore (abstract)
  ├── NoCoreStrategy        → flat base points
  ├── ComboCoreStrategy     → streak bonus
  ├── OracleCoreStrategy    → hint reveal + penalty
  └── SpeedsterCoreStrategy → time-based scoring
  └── [FutureCore]Strategy  ← one new file, done ✅
```

**Adding a new core = 1 new file (BE) + 1 registry entry each side. That's it.**

### Backend files

| File | Purpose |
|---|---|
| `server/src/cores/BaseCore.ts` | Abstract class + `ScoringContext` + `ScoringResult` types |
| `server/src/cores/[Name]Strategy.ts` | One file per core, implements `calculateCorrect(ctx)` |
| `server/src/cores/index.ts` | **Registry** — maps core name → strategy. Edit here to add cores. |

### Frontend files

| File | Purpose |
|---|---|
| `client/src/game/cores/BaseCore.ts` | `CoreModule` interface definition |
| `client/src/game/cores/registry.ts` | **Registry** — maps Supabase UUID → UI config. Edit here to add cores. |

### How GameplayView.vue uses it

```ts
// Single computed — no more hardcoded UUIDs in the view
const activeCoreModule = computed(() => getCoreModule(gameStore.activeCoreId))

// Template bindings become data-driven:
// :class="activeCoreModule.timerColor"
// :class="activeCoreModule.timerClass"
// v-if="activeCoreModule.showWindOverlay"
// popupType = activeCoreModule.popupType
```

---

## Scoring Logic (How Points Work)

### Correct answer flow

1. `submitAnswer()` in `gameController.ts` receives `{ answer, time_taken, current_combo, active_core_id, oracle_reveal_level }`
2. Validates session ownership + anti-cheat (core ID must match session's stored core)
3. Fetches core row from DB (`flat_buff`, `multiplier_buff`, `name`)
4. Calls `runScoring(isCorrect, core.name, ctx)` from `server/src/cores/index.ts`
5. `getCoreStrategy(core.name)` finds the right strategy class
6. `strategy.calculateCorrect(ctx)` or `strategy.calculateWrong(ctx)` returns `{ pointsDelta, breakdown }`
7. Score is updated in `game_sessions`, answer recorded in `game_session_answers`

### Core formulas

```
No Core / Combo Core:
  pointsDelta = floor( (100 + comboBonus + flat_buff) × multiplier_buff ) − oraclePenalty
  comboBonus  = min(combo × 10, 100)   [only for Combo Core, 0 otherwise]

Oracle Core:
  Same as No Core but always carries oraclePenalty (even on wrong answers)
  oraclePenalty: Lv1=10, Lv2=30, Lv3=60 (cumulative)

Speedster Core:
  speedBonus  = max(0, floor( (1 − timeTaken/8000) × 150 ))
  pointsDelta = 100 + speedBonus         [ignores flat_buff and multiplier_buff entirely]
  Answer in 1s  → ~231 pts
  Answer in 3s  → ~193 pts
  Answer in 6s  → ~137 pts
  Answer in 8s+ →  100 pts (no speed bonus)
```

### Wrong answer penalty

```
accuracy = 1 − levenshteinDistance(typed, target) / max(len(typed), len(target))

If accuracy ≥ 80% (close miss / typo):
  penalty = max(1, distance × 2)         → small deduction

If accuracy < 80% or empty (skip):
  penalty = clamp(distance × 10, 10, 50) → larger deduction
```

---

## Frontend: How time_taken is Tracked

```ts
// In GameplayView.vue:
const questionStartTime = ref<number>(Date.now())

// Reset on every new question:
async function loadQuestion() {
  // ...
  questionStartTime.value = Date.now()  // ← here
  gameState.value = 'playing'
}

// Captured on answer:
const timeTaken = Date.now() - questionStartTime.value
// → sent as time_taken in the POST body
```

This means **every** answer (correct, wrong, skip) always includes `time_taken`. The backend safely ignores it for cores that don't use it.

---

## Visual Effects (Speedster Core)

### Wind streaks (US-17.2)

6 `<span>` elements with class `.wind-streak.ws1`–`.ws6` inside `.speedster-wind-container`. Each sweeps left→right across the letter-slot area at a different speed (0.65–0.95s) and stagger. Controlled by:

```ts
// registry.ts entry:
showWindOverlay: true

// Template:
v-if="activeCoreModule.showWindOverlay && gameState === 'playing'"
```

### Timer glow (US-17.2)

Timer digit gets `.speedster-timer-glow` (pulsing cyan text-shadow).
Timer icon gets `.speedster-timer-icon` (same pulse + drop-shadow filter).
Timer color changes to `text-cyan-300` via `activeCoreModule.timerColor`.

### "+N FAST!" popup (US-17.3)

When `activeCoreModule.popupType === 'speedster'` and the answer is correct:

```ts
spawnPointPopup(data.points_earned, 'speedster')
```

The popup renders with `.speedster-fast-text` — a shimmer gradient animation on the text, and `.speedster-popup` for a dramatic upward burst (scale + skew + fade, 1.8s).

---

## What to Do Next (Recommended Order)

### Immediate

Speedster is fully wired. The next focus is Sprint 3.

3. **ELO update after match** — call a PATCH on `players.elo` in `timeoutSession()` using a simple Elo formula
4. **Colyseus multiplayer** — create rooms in `server/src/index.ts`, sync opponent score/progress via WebSocket
5. **Real-time opponent UI** — add opponent score bar + letter-slot shadow in `GameplayView.vue`

---

## Rules for AI Agents

1. **Read files before editing.** Use `view_file` on any file you're about to modify.
2. **Never add `if/else` for cores in `gameController.ts`.** Use the strategy registry.
3. **Never add hardcoded core UUIDs to `GameplayView.vue`.** Use `activeCoreModule` from `getCoreModule()`.
4. **Update `CLAUDE.md`** after any significant architectural change.
5. **Update the sprint status** in `CLAUDE.md` when completing a user story.
6. **Do not commit secrets.** `.env` files are gitignored.
7. **The server is source of truth for scores.** The frontend only displays what the server returns.
8. **Anti-cheat must be preserved.** The `active_core_id` validation in `submitAnswer()` must not be removed or weakened.
9. **`time_taken` is always sent from the FE.** It is never guarded by a "if speedster core" check — all cores receive it even if they don't use it.
10. **Speedster UUID is `00000000-0000-0000-0000-000000000007`.** `PENDING_UUID` has been replaced in `registry.ts`. Do not revert this.