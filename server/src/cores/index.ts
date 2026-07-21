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
import { PhoenixCoreStrategy } from './PhoenixCoreStrategy'
import { HighRollerStrategy } from './HighRollerStrategy'

// ── Registry ──────────────────────────────────────────────────────────────────
// Key = lowercase core name as stored in the DB `cores.name` column.

const CORE_REGISTRY: Record<string, BaseCore> = {
  // Phoenix Branch
  'phoenix': new PhoenixCoreStrategy('phoenix', 100, 1, false),
  'phoenix flame': new PhoenixCoreStrategy('phoenix flame', 400, 1, false),
  'rebirth': new PhoenixCoreStrategy('rebirth', 200, 1, true),
  'ashes to ashes': new PhoenixCoreStrategy('ashes to ashes', 0, 1, false, 0.5, 3.0),
  'immortal phoenix': new PhoenixCoreStrategy('immortal phoenix', 800, 1, false),
  'eternal rebirth': new PhoenixCoreStrategy('eternal rebirth', 400, 1, true),
  'supernova ashes': new PhoenixCoreStrategy('supernova ashes', 0, 1, false, 1.0, 5.0),

  // High Roller Branch
  'high roller': new HighRollerStrategy('high roller', 0.5, 2, 0.5),
  'jackpot': new HighRollerStrategy('jackpot', 0.3, 3, 0.5),
  'safe bet': new HighRollerStrategy('safe bet', 0.8, 1.5, 0.5),
  'double or nothing': new HighRollerStrategy('double or nothing', 0.5, 2, 0),
  'all in': new HighRollerStrategy('all in', 0.1, 10, 0.1),
  'house advantage': new HighRollerStrategy('house advantage', 0.7, 2, 0.5),
  'russian roulette': new HighRollerStrategy('russian roulette', 1/6, 12, 0),
  // Balanced Branch
  'balance': new BalancedCoreStrategy('balance'),
  'balanced core': new BalancedCoreStrategy('balanced core'),
  'harmony': new BalancedCoreStrategy('harmony'),
  'perfect harmony': new BalancedCoreStrategy('perfect harmony'),
  'equilibrium': new BalancedCoreStrategy('equilibrium'),
  'yin yang': new BalancedCoreStrategy('yin yang'),
  'steady pace': new BalancedCoreStrategy('steady pace'),
  'zenith': new BalancedCoreStrategy('zenith'),
  'nirvana': new BalancedCoreStrategy('nirvana'),
  'cosmic balance': new BalancedCoreStrategy('cosmic balance'),
  'harmony wave': new BalancedCoreStrategy('harmony wave'),
  'universal harmony': new BalancedCoreStrategy('universal harmony'),

  // Combo Branch
  'perfect combo': new ComboCoreStrategy('perfect combo', 100),
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
  'argus eyes': new OracleCoreStrategy('argus eyes', false),
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
  'speed shield': new SpeedsterCoreStrategy('speed shield'),
  'mach speed': new SpeedsterCoreStrategy('mach speed'),
  'overdrive': new SpeedsterCoreStrategy('overdrive'),
  'time freeze': new SpeedsterCoreStrategy('time freeze'),
  'warp speed': new SpeedsterCoreStrategy('warp speed'),
  'grand prix': new SpeedsterCoreStrategy('grand prix'),
  // BUG FIX #1: Speed Demon was incorrectly using ComboCoreStrategy → now SpeedsterCoreStrategy
  'speed demon': new SpeedsterCoreStrategy('speed demon'),
  'sonic boom': new SpeedsterCoreStrategy('sonic boom'),

  // Mission Branch
  'mission impossible': new MissionCoreStrategy('mission impossible', 5),
  'mission core': new MissionCoreStrategy('mission core', 5),
  'bounty hunter': new MissionCoreStrategy('bounty hunter', 5),
  'exodia': new MissionCoreStrategy('exodia', 5),
  'daily quest': new MissionCoreStrategy('daily quest', 3),
  'shield mission': new AegisCoreStrategy('shield mission', 3, false, false),
  'time mission': new MissionCoreStrategy('time mission', 5),
  'bounty overlord': new MissionCoreStrategy('bounty overlord', 5),
  // BUG FIX #4: missionReq was 1 → triggered bonus every single correct answer → now 3
  'apex predator': new MissionCoreStrategy('apex predator', 3),
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
  // penaltyMultiplier: T1=1.0×, T2=2.0×, T3=3.0× — consistent risk/reward escalation
  'power strike': new PowerCoreStrategy('power strike', 1.0),
  'power core': new PowerCoreStrategy('power core', 1.0),
  // T2 Power: all have 2.0× penalty
  'overclock': new PowerCoreStrategy('overclock', 2.0),
  'hypercharge': new PowerCoreStrategy('hypercharge', 2.0),
  'power surge': new PowerCoreStrategy('power surge', 2.0),
  'brute force': new PowerCoreStrategy('brute force', 2.0),
  'overload': new PowerCoreStrategy('overload', 2.0),
  // T3 Power: all have 3.0× penalty
  'supernova': new PowerCoreStrategy('supernova', 3.0),
  'gigawatt': new PowerCoreStrategy('gigawatt', 3.0),
  'desperado': new PowerCoreStrategy('desperado', 3.0),
  'absolute power': new PowerCoreStrategy('absolute power', 3.0),
  'supermassive': new PowerCoreStrategy('supermassive', 3.0),

  // Pandora Branch
  "pandora's box": new PandoraCoreStrategy(),
  "trickster's glass": new PandoraCoreStrategy("trickster's glass"),
  "chaos theory": new PandoraCoreStrategy("chaos theory"),
  'chaos prism': new PandoraCoreStrategy('chaos prism'),
  'warp reality': new PandoraCoreStrategy('warp reality'),
  "pandora's curse": new PandoraCoreStrategy("pandora's curse"),
  'butterfly effect': new PandoraCoreStrategy('butterfly effect'),
  "pandora's wrath": new PandoraCoreStrategy("pandora's wrath"),
  'cosmic entropy': new PandoraCoreStrategy('cosmic entropy'),
  "pandora's mirror": new PandoraCoreStrategy("pandora's mirror"),
  'reality collapse': new PandoraCoreStrategy('reality collapse'),
  
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
