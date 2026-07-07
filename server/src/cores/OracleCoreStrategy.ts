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
    const beforeMult    = BASE_POINTS + ctx.flatBuff
    const total         = Math.floor(beforeMult * ctx.multiplierBuff) - oraclePenalty

    return {
      pointsDelta: total,
      breakdown: {
        base:            BASE_POINTS,
        combo_bonus:     0,
        flat_buff:       ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
      },
    }
  }

  // Wrong answers for Oracle also carry the hint penalty — override parent default.
  calculateWrong(ctx: ScoringContext): ScoringResult {
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
