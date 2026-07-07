import { BaseCore, ScoringContext, ScoringResult, BASE_POINTS } from './BaseCore'

export class PowerCoreStrategy extends BaseCore {
  readonly coreName: string
  readonly penaltyMultiplier: number

  constructor(name: string = 'power core', penaltyMultiplier: number = 1.0) {
    super()
    this.coreName = name.toLowerCase()
    this.penaltyMultiplier = penaltyMultiplier
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    const beforeMult    = BASE_POINTS + ctx.flatBuff
    const total         = Math.floor(beforeMult * ctx.multiplierBuff) - oraclePenalty

    return {
      pointsDelta: total,
      breakdown: {
        base:           BASE_POINTS,
        combo_bonus:    0,
        flat_buff:      ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty: oraclePenalty,
        penalty:        0,
      },
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    const penalty = Math.floor(ctx.wrongPenalty * this.penaltyMultiplier)
    
    return {
      pointsDelta: -(penalty + oraclePenalty),
      breakdown: {
        base: 0,
        combo_bonus: 0,
        flat_buff: 0,
        multiplier_buff: 1,
        oracle_penalty: oraclePenalty,
        penalty: penalty,
      },
    }
  }
}
