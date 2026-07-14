import { BaseCore, ScoringContext, ScoringResult, getBasePoints } from './BaseCore'

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
    const beforeMult    = getBasePoints(ctx.targetWord) + ctx.flatBuff
    const total         = Math.floor(beforeMult * ctx.multiplierBuff) - oraclePenalty

    return {
      pointsDelta: total,
      breakdown: {
        base:           getBasePoints(ctx.targetWord),
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
    let penalty = Math.floor(ctx.wrongPenalty * this.penaltyMultiplier)
    let lockInputMs = 0
    let timerDelta = 0
    
    if (this.coreName === 'brute force') {
      penalty = 50
    } else if (this.coreName === 'supermassive') {
      penalty = 200
    } else if (this.coreName === 'absolute power') {
      penalty = 100
    } else if (this.coreName === 'overload') {
      lockInputMs = 2000
    } else if (this.coreName === 'desperado') {
      timerDelta = -999000 // Instantly ends the match
    }

    return {
      pointsDelta: -(penalty + oraclePenalty),
      lockInputMs: lockInputMs > 0 ? lockInputMs : undefined,
      timerDelta: timerDelta < 0 ? timerDelta : undefined,
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
