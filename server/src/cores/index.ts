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
import { NoCoreStrategy } from './NoCoreStrategy'
import { ComboCoreStrategy } from './ComboCoreStrategy'
import { OracleCoreStrategy } from './OracleCoreStrategy'
import { SpeedsterCoreStrategy } from './SpeedsterCoreStrategy'
import { MissionCoreStrategy } from './MissionCoreStrategy'
import { AegisCoreStrategy } from './AegisCoreStrategy'
import { PandoraCoreStrategy } from './PandoraCoreStrategy'
import { PowerCoreStrategy } from './PowerCoreStrategy'
import { BalancedCoreStrategy } from './BalancedCoreStrategy'

// ── Registry ──────────────────────────────────────────────────────────────────
// Key = lowercase core name as stored in the DB `cores.name` column.

const CORE_REGISTRY: Record<string, BaseCore> = {
  // Balanced Branch
  'balanced core': new BalancedCoreStrategy('balanced core', false),
  'harmony core': new BalancedCoreStrategy('harmony core', false),
  'perfect harmony': new BalancedCoreStrategy('perfect harmony', true),

  // Combo Branch
  'combo core': new ComboCoreStrategy('combo core', 100),
  'radiant combo': new ComboCoreStrategy('radiant combo', 200),
  'prismatic combo': new ComboCoreStrategy('prismatic combo', 300),

  // Oracle Branch
  'oracle core': new OracleCoreStrategy('oracle core', false),
  'clairvoyance': new OracleCoreStrategy('clairvoyance', true),
  'omniscience': new OracleCoreStrategy('omniscience', true),

  // Speedster Branch
  'speedster':  new SpeedsterCoreStrategy('speedster'),
  'time warp': new SpeedsterCoreStrategy('time warp'),
  'chronobreak': new SpeedsterCoreStrategy('chronobreak'),

  // Mission Branch
  'mission core': new MissionCoreStrategy('mission core', 5),
  'bounty hunter': new MissionCoreStrategy('bounty hunter', 5),
  'exodia': new MissionCoreStrategy('exodia', 10),

  // Aegis Branch
  'aegis shield': new AegisCoreStrategy('aegis shield', 3, false, false),
  'reflective aegis': new AegisCoreStrategy('reflective aegis', 3, true, false),
  'bastion of light': new AegisCoreStrategy('bastion of light', 5, false, true),

  // Power Branch
  'power core': new PowerCoreStrategy('power core', 1.0),
  'overclock core': new PowerCoreStrategy('overclock core', 1.0),
  'supernova core': new PowerCoreStrategy('supernova core', 2.0),

  // Pandora Branch
  "pandora's box": new PandoraCoreStrategy(),
  "trickster's glass": new PandoraCoreStrategy(),
  "chaos theory": new PandoraCoreStrategy(),
  
  // Fallback
  'no core':    new NoCoreStrategy(),
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
