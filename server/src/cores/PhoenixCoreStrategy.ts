import { BaseCore, ScoringContext, ScoringResult, getBasePoints } from './BaseCore'

export class PhoenixCoreStrategy extends BaseCore {
  public readonly coreName: string
  
  private bonusAmount: number
  private requiredMisses: number
  private nullifyPenalty: boolean
  private scalingMultiplier: number
  private maxMultiplier: number

  constructor(
    coreName: string,
    bonusAmount: number = 200,
    requiredMisses: number = 1,
    nullifyPenalty: boolean = false,
    scalingMultiplier: number = 0,
    maxMultiplier: number = 0
  ) {
    super()
    this.coreName = coreName
    this.bonusAmount = bonusAmount
    this.requiredMisses = requiredMisses
    this.nullifyPenalty = nullifyPenalty
    this.scalingMultiplier = scalingMultiplier
    this.maxMultiplier = maxMultiplier
  }

  private hasConsecutiveMisses(history: boolean[], amount: number): boolean {
    // history includes the current answer (which is true since this is calculateCorrect)
    // we need to look at the 'amount' answers *before* the current one.
    // e.g. amount = 2, history = [..., false, false, true]
    if (history.length <= amount) return false
    for (let i = 1; i <= amount; i++) {
      if (history[history.length - 1 - i] !== false) return false
    }
    return true
  }

  private getConsecutiveMissCount(history: boolean[]): number {
    let count = 0
    // history.length - 1 is the current answer (true)
    for (let i = 1; i < history.length; i++) {
      if (history[history.length - 1 - i] === false) {
        count++
      } else {
        break
      }
    }
    return count
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    let phoenixBonus = 0
    if (this.bonusAmount > 0 && this.hasConsecutiveMisses(ctx.answerHistory, this.requiredMisses)) {
      phoenixBonus = this.bonusAmount
    }

    let dynamicMultiplier = ctx.multiplierBuff
    if (this.scalingMultiplier > 0) {
      const missCount = this.getConsecutiveMissCount(ctx.answerHistory)
      if (missCount > 0) {
        dynamicMultiplier += missCount * this.scalingMultiplier
        if (this.maxMultiplier > 0 && dynamicMultiplier > this.maxMultiplier) {
          dynamicMultiplier = this.maxMultiplier
        }
      }
    }

    const oraclePenalty = this._oraclePenalty(ctx)
    let finalScore = Math.floor(
      (getBasePoints(ctx.targetWord) + ctx.flatBuff + phoenixBonus) * dynamicMultiplier
    )
    finalScore -= oraclePenalty

    return {
      pointsDelta: finalScore,
      breakdown: {
        base: getBasePoints(ctx.targetWord),
        combo_bonus: phoenixBonus,
        flat_buff: ctx.flatBuff,
        multiplier_buff: dynamicMultiplier,
        oracle_penalty: oraclePenalty,
        penalty: 0
      }
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    // If nullifyPenalty is true, the wrong penalty becomes 0
    const appliedPenalty = this.nullifyPenalty ? 0 : ctx.wrongPenalty
    const pointsDelta = -(appliedPenalty + oraclePenalty)

    return {
      pointsDelta,
      breakdown: {
        base: 0,
        combo_bonus: 0,
        flat_buff: 0,
        multiplier_buff: 0,
        oracle_penalty: oraclePenalty,
        penalty: appliedPenalty
      }
    }
  }
}
