import { BaseCore, ScoringContext, ScoringResult, BASE_POINTS } from './BaseCore'

export class MissionCoreStrategy extends BaseCore {
  readonly coreName = 'mission core'
  
  // The pattern we want to match: 5 correct in a row
  readonly requiredPattern = [true, true, true, true, true]

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    return this._evaluate(ctx, true)
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    return this._evaluate(ctx, false)
  }

  private _evaluate(ctx: ScoringContext, isCorrect: boolean): ScoringResult {
    const base = isCorrect ? BASE_POINTS : 0
    const penalty = isCorrect ? 0 : ctx.wrongPenalty
    const oraclePenalty = this._oraclePenalty(ctx)

    // Check pattern match: count consecutive correct answers at the end of history
    let missionBonus = 0
    let missionCompleted = 0
    const hist = ctx.answerHistory || []
    
    let consecutiveCorrect = 0
    for (let i = hist.length - 1; i >= 0; i--) {
      if (hist[i] === true) {
        consecutiveCorrect++
      } else {
        break
      }
    }

    if (consecutiveCorrect > 0 && consecutiveCorrect % 5 === 0) {
      missionBonus = ctx.flatBuff || 500 // flat bonus score
      missionCompleted = 1
    }

    const net = (base + missionBonus) * ctx.multiplierBuff - penalty - oraclePenalty

    return {
      pointsDelta: net,
      breakdown: {
        base,
        combo_bonus: 0,
        flat_buff: missionBonus, 
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty: oraclePenalty,
        penalty,
        mission_completed: missionCompleted
      }
    }
  }
}
