import { BaseCore, ScoringContext, ScoringResult, getBasePoints } from './BaseCore'

export class MissionCoreStrategy extends BaseCore {
  readonly coreName: string;
  readonly missionReq: number;

  constructor(name: string = 'mission core', missionReq: number = 5) {
    super()
    this.coreName = name.toLowerCase()
    this.missionReq = missionReq
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    return this._evaluate(ctx, true)
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    return this._evaluate(ctx, false)
  }

  private _evaluate(ctx: ScoringContext, isCorrect: boolean): ScoringResult {
    const base = isCorrect ? getBasePoints(ctx.targetWord) : 0
    const penalty = isCorrect ? 0 : ctx.wrongPenalty
    const oraclePenalty = this._oraclePenalty(ctx)

    // Check pattern match: count consecutive correct answers at the end of history
    let missionBonus = 0
    let missionCompleted = 0
    const hist = ctx.answerHistory || []
    
    let consecutiveCorrect = 0
    if (ctx.missionProgress !== undefined) {
      consecutiveCorrect = ctx.missionProgress + (isCorrect ? 1 : 0)
      
      // Swift Mission: must be answered in under 4s
      if (this.coreName === 'swift mission' && isCorrect && ctx.timeTaken > 4000) {
        consecutiveCorrect = 0
      }

      if (!isCorrect) {
        // Shield Mission Special: streak does NOT break if protected by a shield
        const isShieldMission = this.coreName === 'shield mission'
        const currentShields = ctx.currentShields || 0
        if (isShieldMission && currentShields > 0) {
          consecutiveCorrect = ctx.missionProgress
        } else {
          consecutiveCorrect = 0
        }
      }
    } else {
      // Fallback if no missionProgress provided
      for (let i = hist.length - 1; i >= 0; i--) {
        if (hist[i] === true) {
          consecutiveCorrect++
        } else {
          break
        }
      }
    }

    let timerDelta = 0

    if (consecutiveCorrect > 0 && consecutiveCorrect % this.missionReq === 0) {
      missionBonus = ctx.flatBuff || 500 // default fallback
      
      if (this.coreName === 'time mission') {
        timerDelta = 10000 // +10s to timer
      }
      
      if (this.coreName === 'mission master') {
        if (consecutiveCorrect === 3) {
           missionBonus = 1000
        } else if (consecutiveCorrect === 6) {
           missionBonus = 3000
        }
      }

      missionCompleted = 1
    }

    const net = (base + missionBonus) * ctx.multiplierBuff - penalty - oraclePenalty

    return {
      pointsDelta: net,
      timerDelta: timerDelta > 0 ? timerDelta : undefined,
      breakdown: {
        base,
        combo_bonus: 0,
        flat_buff: missionBonus, 
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty: oraclePenalty,
        penalty,
        mission_completed: missionCompleted,
        mission_streak: consecutiveCorrect % this.missionReq
      }
    }
  }
}
