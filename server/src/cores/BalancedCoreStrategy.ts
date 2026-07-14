import { BaseCore, ScoringContext, ScoringResult, getBasePoints } from './BaseCore'

export class BalancedCoreStrategy extends BaseCore {
  readonly coreName: string
  readonly immuneToPenalty: boolean
  /**
   * Harmony Wave special: the first 2 wrong answers in the session are blocked
   * (no point deduction). Tracked via answerHistory wrong-answer count.
   */
  readonly harmonyWaveImmunity: boolean

  constructor(
    name: string = 'balanced core',
    immuneToPenalty: boolean = false,
    harmonyWaveImmunity: boolean = false,
  ) {
    super()
    this.coreName = name.toLowerCase()
    this.immuneToPenalty = immuneToPenalty
    this.harmonyWaveImmunity = harmonyWaveImmunity
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

    // Harmony Wave: first 2 wrong answers are completely blocked
    if (this.harmonyWaveImmunity) {
      // answerHistory already includes the current wrong answer (pushed before calling runScoring)
      const totalWrongs = ctx.answerHistory.filter(a => !a).length
      if (totalWrongs <= 2) {
        return {
          pointsDelta: -oraclePenalty,
          breakdown: {
            base:              0,
            combo_bonus:       0,
            flat_buff:         0,
            multiplier_buff:   1,
            oracle_penalty:    oraclePenalty,
            penalty:           0,
            harmony_blocked:   1,
          },
        }
      }
    }

    // Perfect Harmony / Universal Harmony: immune to ALL wrong-answer penalties
    if (this.immuneToPenalty) {
      return {
        pointsDelta: -oraclePenalty,
        breakdown: {
          base:           0,
          combo_bonus:    0,
          flat_buff:      0,
          multiplier_buff: 1,
          oracle_penalty: oraclePenalty,
          penalty:        0,
        },
      }
    }

    return super.calculateWrong(ctx)
  }
}
