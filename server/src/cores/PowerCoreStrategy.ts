import { BaseCore, ScoringContext, ScoringResult, BASE_POINTS } from './BaseCore'

export class PowerCoreStrategy extends BaseCore {
  readonly coreName: string
  readonly penaltyMultiplier: number

  constructor(name: string = 'power core', penaltyMultiplier: number = 1.0) {
    super()
    this.coreName = name.toLowerCase()
    this.penaltyMultiplier = penaltyMultiplier
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
