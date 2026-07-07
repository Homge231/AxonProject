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
  'equilibrium': new BalancedCoreStrategy('equilibrium', false),
  'yin yang': new BalancedCoreStrategy('yin yang', false),
  'steady pace': new BalancedCoreStrategy('steady pace', false),
  'zenith core': new BalancedCoreStrategy('zenith core', false),
  'nirvana': new BalancedCoreStrategy('nirvana', false),
  'cosmic balance': new BalancedCoreStrategy('cosmic balance', false),
  'harmony wave': new BalancedCoreStrategy('harmony wave', false),
  'universal harmony': new BalancedCoreStrategy('universal harmony', true),

  // Combo Branch
  'combo core': new ComboCoreStrategy('combo core', 100),
  'radiant combo': new ComboCoreStrategy('radiant combo', 200),
  'prismatic combo': new ComboCoreStrategy('prismatic combo', 300),
  'combo shield': new AegisCoreStrategy('combo shield', 3, false, false),
  'combo time': new ComboCoreStrategy('combo time', 100),
  'combo multiplier': new ComboCoreStrategy('combo multiplier', 100),
  'golden combo': new ComboCoreStrategy('golden combo', 500),
  'chain lightning': new ComboCoreStrategy('chain lightning', 100),
  'combo mastery': new ComboCoreStrategy('combo mastery', 100),
  'combo focus': new ComboCoreStrategy('combo focus', 100),
  'super combo': new ComboCoreStrategy('super combo', 250),

  // Oracle Branch
  'oracle core': new OracleCoreStrategy('oracle core', false),
  'clairvoyance': new OracleCoreStrategy('clairvoyance', true),
  'omniscience': new OracleCoreStrategy('omniscience', true),
  'third eye': new OracleCoreStrategy('third eye', true),
  'future sight': new OracleCoreStrategy('future sight', true),
  'divine guidance': new OracleCoreStrategy('divine guidance', true),
  'mind reader': new OracleCoreStrategy('mind reader', true),
  'predictive strike': new OracleCoreStrategy('predictive strike', true),
  'cosmic wisdom': new OracleCoreStrategy('cosmic wisdom', true),
  'oracle blessing': new OracleCoreStrategy('oracle blessing', true),
  'divine eye': new OracleCoreStrategy('divine eye', true),

  // Speedster Branch
  'speedster':  new SpeedsterCoreStrategy('speedster'),
  'time warp': new SpeedsterCoreStrategy('time warp'),
  'chronobreak': new SpeedsterCoreStrategy('chronobreak'),
  'speed shield': new AegisCoreStrategy('speed shield', 3, false, false),
  'mach speed': new SpeedsterCoreStrategy('mach speed'),
  'overdrive': new SpeedsterCoreStrategy('overdrive'),
  'time freeze': new SpeedsterCoreStrategy('time freeze'),
  'warp speed': new SpeedsterCoreStrategy('warp speed'),
  'grand prix': new SpeedsterCoreStrategy('grand prix'),
  'speed demon': new SpeedsterCoreStrategy('speed demon'),
  'sonic boom': new SpeedsterCoreStrategy('sonic boom'),

  // Mission Branch
  'mission core': new MissionCoreStrategy('mission core', 5),
  'bounty hunter': new MissionCoreStrategy('bounty hunter', 5),
  'exodia': new MissionCoreStrategy('exodia', 10),
  'daily quest': new MissionCoreStrategy('daily quest', 3),
  'shield mission': new AegisCoreStrategy('shield mission', 3, false, false),
  'time mission': new MissionCoreStrategy('time mission', 5),
  'bounty overlord': new MissionCoreStrategy('bounty overlord', 5),
  'apex predator': new MissionCoreStrategy('apex predator', 1),
  'mission specialist': new MissionCoreStrategy('mission specialist', 4),
  'swift mission': new MissionCoreStrategy('swift mission', 3),
  'mission master': new MissionCoreStrategy('mission master', 3),

  // Aegis Branch
  'aegis shield': new AegisCoreStrategy('aegis shield', 3, false, false),
  'reflective aegis': new AegisCoreStrategy('reflective aegis', 3, true, false),
  'bastion of light': new AegisCoreStrategy('bastion of light', 5, false, true),
  'shield battery': new AegisCoreStrategy('shield battery', 4, false, false),
  'fortress aegis': new AegisCoreStrategy('fortress aegis', 3, false, false),
  'shield synergy': new AegisCoreStrategy('shield synergy', 3, false, false),
  'spiked shield': new AegisCoreStrategy('spiked shield', 3, true, false),
  'indomitable': new AegisCoreStrategy('indomitable', 3, false, false),
  'aegis nova': new AegisCoreStrategy('aegis nova', 3, false, false),
  'shield burst': new AegisCoreStrategy('shield burst', 3, false, false),
  'guardian angel': new AegisCoreStrategy('guardian angel', 3, false, false),

  // Power Branch
  'power core': new PowerCoreStrategy('power core', 1.0),
  'overclock core': new PowerCoreStrategy('overclock core', 1.0),
  'supernova core': new PowerCoreStrategy('supernova core', 2.0),
  'hypercharge': new PowerCoreStrategy('hypercharge', 1.0),
  'power surge': new PowerCoreStrategy('power surge', 2.0),
  'brute force': new PowerCoreStrategy('brute force', 1.0),
  'gigawatt core': new PowerCoreStrategy('gigawatt core', 1.0),
  'desperado': new PowerCoreStrategy('desperado', 1.0),
  'absolute power': new PowerCoreStrategy('absolute power', 1.0),
  'overload': new PowerCoreStrategy('overload', 1.0),
  'supermassive core': new PowerCoreStrategy('supermassive core', 1.0),

  // Pandora Branch
  "pandora's box": new PandoraCoreStrategy(),
  "trickster's glass": new PandoraCoreStrategy(),
  "chaos theory": new PandoraCoreStrategy(),
  'chaos prism': new PandoraCoreStrategy(),
  'warp reality': new PandoraCoreStrategy(),
  "pandora's curse": new PandoraCoreStrategy(),
  'butterfly effect': new PandoraCoreStrategy(),
  "pandora's wrath": new PandoraCoreStrategy(),
  'cosmic entropy': new PandoraCoreStrategy(),
  "pandora's mirror": new PandoraCoreStrategy(),
  'reality collapse': new PandoraCoreStrategy(),
  
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
