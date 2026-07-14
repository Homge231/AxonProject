import { BaseCore, ScoringContext, ScoringResult, getBasePoints } from './BaseCore'

export class BalancedCoreStrategy extends BaseCore {
  readonly coreName: string

  constructor(name: string = 'balanced core') {
    super()
    this.coreName = name.toLowerCase()
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    let beforeMult = getBasePoints(ctx.targetWord) + ctx.flatBuff
    let total = Math.floor(beforeMult * ctx.multiplierBuff)
    let timerDelta = 0

    // Specific Core Effects
    if (this.coreName === 'zenith') {
      total = 300 // Fixed +300 for Zenith
    } else if (this.coreName === 'equilibrium') {
      total = Math.floor(total * 0.7) // 70% of normal score
    } else if (this.coreName === 'steady pace') {
      timerDelta = 1000 // +1s
    }

    return {
      pointsDelta: total - oraclePenalty,
      timerDelta: timerDelta > 0 ? timerDelta : undefined,
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
    let penalty = ctx.wrongPenalty
    let forgiveMistake = false

    if (this.coreName === 'zenith') {
      penalty = 30 // Fixed -30 for Zenith
    } else if (this.coreName === 'equilibrium') {
      penalty = Math.floor(penalty * 0.3) // 30% of normal penalty
    } else if (this.coreName === 'yin yang') {
      penalty = 5 // Fixed -5
    } else if (this.coreName === 'cosmic balance') {
      penalty = 10 // Fixed -10
    } else if (this.coreName === 'harmony wave') {
      // first 2 wrong answers are blocked and don't break streak
      const totalWrongs = ctx.answerHistory.filter(a => !a).length
      if (totalWrongs <= 2) {
        penalty = 0
        forgiveMistake = true
      }
    } else if (this.coreName === 'nirvana') {
      // Normal penalty, but doesn't break streak
      forgiveMistake = true
    } else if (this.coreName === 'universal harmony' || this.coreName === 'perfect harmony') {
      penalty = 0 // Immune to penalty
    }

    return {
      pointsDelta: -(penalty + oraclePenalty),
      forgiveMistake: forgiveMistake ? true : undefined,
      breakdown: {
        base:           0,
        combo_bonus:    0,
        flat_buff:      0,
        multiplier_buff: 1,
        oracle_penalty: oraclePenalty,
        penalty:        penalty,
      },
    }
  }
}
