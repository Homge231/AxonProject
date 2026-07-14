import { BaseCore, getBasePoints, ScoringContext, ScoringResult } from './BaseCore'

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
    // Clairvoyance forgives the oracle hint penalty
    this.forgivePenalty = this.coreName === 'clairvoyance' || forgivePenalty
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
    
    // Oracle Blessing: 1.5x multiplier if no hints used
    if (this.coreName === 'oracle blessing' && ctx.oracleRevealLevel === 0) {
      multiplierBuff *= 1.5
    }

    const beforeMult    = getBasePoints(ctx.targetWord) + flatBuff
    let total         = Math.floor(beforeMult * multiplierBuff) - oraclePenalty

    // Predictive Strike: +300 bonus points if all 3 hints revealed
    if (this.coreName === 'predictive strike' && ctx.oracleRevealLevel === 3) {
      total += 300
    }

    return {
      pointsDelta: total,
      breakdown: {
        base:            getBasePoints(ctx.targetWord),
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
    // Exception: Clairvoyance
    const oraclePenalty = this.forgivePenalty ? 0 : this._oraclePenalty(ctx)
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
