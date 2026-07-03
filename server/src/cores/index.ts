// ── Core Registry ─────────────────────────────────────────────────────────────
//
// HOW TO ADD A NEW CORE — only this file needs to change:
//   1. Create  server/src/cores/YourCoreStrategy.ts  (extend BaseCore)
//   2. Import it below
//   3. Add one entry to CORE_REGISTRY with the name matching your DB `name` column
//
// The name key is normalised to lowercase+trimmed before lookup,
// so 'Speedster', 'SPEEDSTER', 'speedster' all resolve to the same strategy.
// ─────────────────────────────────────────────────────────────────────────────

import { BaseCore, ScoringContext, ScoringResult } from './BaseCore'
import { NoCoreStrategy }       from './NoCoreStrategy'
import { ComboCoreStrategy }    from './ComboCoreStrategy'
import { OracleCoreStrategy }   from './OracleCoreStrategy'
import { SpeedsterCoreStrategy} from './SpeedsterCoreStrategy'
import { MissionCoreStrategy }  from './MissionCoreStrategy'

// ── Registry ──────────────────────────────────────────────────────────────────
// Key = lowercase core name as stored in the DB `cores.name` column.

const CORE_REGISTRY: Record<string, BaseCore> = {
  'no core':    new NoCoreStrategy(),
  'combo core': new ComboCoreStrategy(),
  'oracle core':new OracleCoreStrategy(),
  'speedster':  new SpeedsterCoreStrategy(),
  'mission core': new MissionCoreStrategy(),
  // ↑ Add new cores here — nothing else needs to change.
}

/** Fallback used when the DB row has an unrecognised name. */
const _fallback = new NoCoreStrategy()

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the strategy for the given core name.
 * Falls back to NoCoreStrategy if the name is unknown so the game never crashes.
 */
export function getCoreStrategy(coreName: string): BaseCore {
  const key = coreName?.trim().toLowerCase() ?? ''
  const strategy = CORE_REGISTRY[key]
  if (!strategy) {
    console.warn(`[CoreRegistry] Unknown core name "${coreName}" — falling back to NoCore.`)
    return _fallback
  }
  return strategy
}

/**
 * Convenience: run the full scoring pipeline in one call.
 *
 * @param isCorrect - whether the player's answer was correct
 * @param coreName  - `cores.name` column value from the DB
 * @param ctx       - scoring context assembled by the controller
 */
export function runScoring(
  isCorrect: boolean,
  coreName: string,
  ctx: ScoringContext,
): ScoringResult {
  const strategy = getCoreStrategy(coreName)
  return isCorrect ? strategy.calculateCorrect(ctx) : strategy.calculateWrong(ctx)
}

export type { BaseCore, ScoringContext, ScoringResult }
