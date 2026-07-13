import { BaseCore, ScoringContext, ScoringResult, getBasePoints } from './BaseCore'

export class HighRollerStrategy extends BaseCore {
  public readonly coreName: string
  
  private winChance: number
  private winMultiplier: number
  private loseMultiplier: number

  constructor(
    coreName: string,
    winChance: number = 0.5,
    winMultiplier: number = 2,
    loseMultiplier: number = 0.5,
    
  ) {
    super()
    this.coreName = coreName
    this.winChance = winChance
    this.winMultiplier = winMultiplier
    this.loseMultiplier = loseMultiplier
    
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)

    // Calculate base first
    const baseScore = Math.floor(
      (getBasePoints(ctx.targetWord) + ctx.flatBuff) * ctx.multiplierBuff
    )
    
    const isLucky = Math.random() < this.winChance
    const multiplier = isLucky ? this.winMultiplier : this.loseMultiplier
    
    let finalScore = Math.floor(baseScore * multiplier)
    finalScore -= oraclePenalty

    return {
      pointsDelta: finalScore,
      breakdown: {
        base: getBasePoints(ctx.targetWord),
        combo_bonus: 0, 
        flat_buff: ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff * multiplier, // Show the effective multiplier
        oracle_penalty: oraclePenalty,
        penalty: 0
      }
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    const pointsDelta = -(ctx.wrongPenalty + oraclePenalty)

    return {
      pointsDelta,
      breakdown: {
        base: 0,
        combo_bonus: 0,
        flat_buff: 0,
        multiplier_buff: 0,
        oracle_penalty: oraclePenalty,
        penalty: ctx.wrongPenalty
      }
    }
  }
}
