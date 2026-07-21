# AGENTS.md — AI Agent Handoff (condensed)

> Full architecture/scoring detail lives in `CLAUDE.md`. This file = current state + next steps only.

## Project
Naenra (ARENA.ENG) — competitive typing game, 60s timed vocabulary matches with power-up "Support Cores".
FE: Vue3+TS+Pinia+Tailwind (`client/`). BE: Node+Express+TS+Supabase (`server/`). Live: naenra.xyz / api.naenra.xyz.

## Done ✅ (Sprint 1–4, closed)
Auth (email/password+OTP, Google OAuth, reset), JWT middleware, profile/elo/rank, 60s match loop, letter-slot UI, score popups, batch question fetch, session lifecycle, anti-cheat, Core Strategy Pattern (BE `server/src/cores/`, FE `client/src/game/cores/`), Levenshtein penalty, Combo/Oracle/Speedster cores, Support Core selection UI (15s), 3-Round loop (Select→Type→Recap), dynamic backgrounds, AI question generator.

## In progress 🔄 (Sprint 5, active)
- Single active session enforcement — `session_version` col + RPC + JWT check, invalidated via Supabase Realtime Broadcast (REST). Verify `authMiddleware.ts` for completion state.
- `fetchWithAuth` race condition — stale 401 can clear a freshly written valid token.
- Colyseus version alignment — client/server on `@colyseus/sdk` v0.17+.
- Vocabulary analytics, tutorials, core tooltips.

## Not yet scheduled ❌
ELO update post-match; full Colyseus multiplayer rooms/opponent sync (WS infra groundwork is Sprint 5, matchmaking rooms unconfirmed). Không đủ dữ liệu để xác minh sprint — check Jira backlog before planning.

## Sprint Timeline (Jira project `IN`, verified 2026-07-20)
| Sprint | State | Dates | Issues | Goal |
|---|---|---|---|---|
| 1 | closed | 06-15→06-21 | 14/14 Done | Auth + protected Lobby |
| 2 | closed | 06-22→06-29 | 18 (17 Done/1 To Do) | Core game loop |
| 3: Support Core | closed | 06-29→07-06 | 44 (35 Done/2 Waiting/7 To Do) | 15s core select, server scoring, 6 tactical cores |
| 4: Core Loop Completion | closed | 07-06→07-13 | 47 (32 Done/15 To Do) | 3-Round loop, backgrounds, session security, AI questions |
| 5: Single-Player Polish | active | 07-13→07-20 | 54 (16 Done/36 To Do/2 In Review) | Analytics/tutorials/tooltips + WS/Colyseus groundwork |

16 issues unassigned to any sprint.

## Rules for AI Agents
1. Read files before editing; never just describe changes.
2. No `if/else` per-core in `gameController.ts` — use strategy registry.
3. No hardcoded core UUIDs in `GameplayView.vue` — use `activeCoreModule`.
4. Update `CLAUDE.md` sprint status after completing a story — cross-check Jira `IN`, don't carry forward assumptions.
5. No secrets in commits (`.env` gitignored).
6. Server is source of truth for scores.
7. Anti-cheat (`active_core_id` check in `submitAnswer()`) must not be weakened.
8. `time_taken` always sent from FE regardless of core.
9. Don't state a sprint assignment unless Jira-verified.