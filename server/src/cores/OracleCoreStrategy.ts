import { BaseCore, BASE_POINTS, ScoringContext, ScoringResult } from './BaseCore'

/**
 * Oracle Core
 *
 * Lets players reveal letter hints at escalating point costs.
 * Correct answers are penalised proportionally to how many hint levels were used.
 *
 * Reveal costs (cumulative):
 *   Level 1 → -10 pts
 *   Level 2 → -30 pts  (cumulative: 10 + 20)
 *   Level 3 → -60 pts  (cumulative: 10 + 20 + 30)
 *
 * Formula: floor( (BASE + flat_buff) * multiplier_buff ) - oraclePenalty
 * Wrong answers also carry the oracle penalty on top of the Levenshtein penalty.
 */
export class OracleCoreStrategy extends BaseCore {
  readonly coreName: string;
  readonly forgivePenalty: boolean;

  constructor(name: string = 'oracle core', forgivePenalty: boolean = false) {
    super()
    this.coreName = name.toLowerCase()
    this.forgivePenalty = forgivePenalty
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this.forgivePenalty ? 0 : this._oraclePenalty(ctx)
    
    let flatBuff = ctx.flatBuff
    let multiplierBuff = ctx.multiplierBuff

    // Future Sight: correct in under 4s grants +50 flat points
    if (this.coreName === 'future sight' && ctx.timeTaken <= 4000) {
      flatBuff += 50
    }

    // Cosmic Wisdom: 2.0x multiplier if no hints used
    if (this.coreName === 'cosmic wisdom' && ctx.oracleRevealLevel === 0) {
      multiplierBuff *= 2.0
    }

    const beforeMult    = BASE_POINTS + flatBuff
    let total         = Math.floor(beforeMult * multiplierBuff) - oraclePenalty

    // Predictive Strike: +300 bonus points if all 3 hints revealed
    if (this.coreName === 'predictive strike' && ctx.oracleRevealLevel === 3) {
      total += 300
    }

    return {
      pointsDelta: total,
      breakdown: {
        base:            BASE_POINTS,
        combo_bonus:     0,
        flat_buff:       flatBuff,
        multiplier_buff: multiplierBuff,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
      },
    }
  }

  // Wrong answers for Oracle also carry the hint penalty — override parent default.
  calculateWrong(ctx: ScoringContext): ScoringResult {
    // If the player answers incorrectly, they must ALWAYS pay for the hints they revealed,
    // even if they have a "free oracle" core like Future Sight.
    const oraclePenalty = this._oraclePenalty(ctx)
    return {
      pointsDelta: -(ctx.wrongPenalty + oraclePenalty),
      breakdown: {
        base:            0,
        combo_bonus:     0,
        flat_buff:       0,
        multiplier_buff: 1,
        oracle_penalty:  oraclePenalty,
        penalty:         ctx.wrongPenalty,
      },
    }
  }
}

/**
 * Oracle Blessing (Tier 2 Oracle Upgrade Core)
 *
 * Hints are completely free (no point cost).
 * However, if the player answers correctly WITHOUT using any hints,
 * they receive a 1.5x point multiplier on their score.
 */
export class OracleBlessingStrategy extends BaseCore {
  readonly coreName: string;

  constructor(name: string = 'oracle blessing') {
    super()
    this.coreName = name.toLowerCase()
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const beforeMult = BASE_POINTS + ctx.flatBuff
    const total      = Math.floor(beforeMult * ctx.multiplierBuff)

    return {
      pointsDelta: total,
      breakdown: {
        base:            BASE_POINTS,
        combo_bonus:     0,
        flat_buff:       ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty:  0,
        penalty:         0,
      },
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    return {
      pointsDelta: -ctx.wrongPenalty,
      breakdown: {
        base:            0,
        combo_bonus:     0,
        flat_buff:       0,
        multiplier_buff: 1,
        oracle_penalty:  0,
        penalty:         ctx.wrongPenalty,
      },
    }
  }
}
