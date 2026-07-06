import {
  BaseCore,
  BASE_POINTS,
  ScoringContext,
  ScoringResult,
} from './BaseCore'

/**
 * Aegis Shield Core
 *
 * Safety net. Correct answers stack shields (Max 3). 
 * Mistakes consume 1 shield instead of losing points.
 */
export class AegisCoreStrategy extends BaseCore {
  readonly coreName = 'aegis shield'

  // Helper to calculate the current shield count based on answer history
  private getShieldCount(initial: number, history: boolean[]): number {
    return history.reduce((shields, isCorrect) => {
      if (isCorrect) return Math.min(shields + 1, 3) // Max 3 shields
      return Math.max(0, shields - 1)
    }, initial)
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    // Formula: floor( (BASE + flat_buff) * multiplier_buff )
    const beforeMult = BASE_POINTS + ctx.flatBuff
    const total      = Math.floor(beforeMult * ctx.multiplierBuff) - oraclePenalty

    // Even though we calculate correct, the shield count is calculated from history
    // if the frontend needs it, but we only really need it for 'blocked' events.

    return {
      pointsDelta: total,
      breakdown: {
        base:            BASE_POINTS,
        combo_bonus:     0,
        flat_buff:       ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
        finalShieldCount: this.getShieldCount(ctx.initialShieldCount || 0, ctx.answerHistory)
      },
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    
    // Calculate shields right BEFORE this wrong answer
    // ctx.answerHistory includes the CURRENT (wrong) answer at the end, so we omit the last item.
    const historyBeforeThisAnswer = ctx.answerHistory.slice(0, -1)
    const currentShields = this.getShieldCount(ctx.initialShieldCount || 0, historyBeforeThisAnswer)

    if (currentShields > 0) {
      // Shield blocks the penalty! (Oracle penalty still applies if they bought a hint)
      return {
        pointsDelta: -oraclePenalty,
        breakdown: {
          base: 0,
          combo_bonus: 0,
          flat_buff: 0,
          multiplier_buff: 1,
          oracle_penalty: oraclePenalty,
          penalty: 0, // penalty reduced to 0
          shield_blocked: 1,
          finalShieldCount: Math.max(0, currentShields - 1)
        },
      }
    }

    // Normal penalty applies
    return {
      pointsDelta: -(ctx.wrongPenalty + oraclePenalty),
      breakdown: {
        base: 0,
        combo_bonus: 0,
        flat_buff: 0,
        multiplier_buff: 1,
        oracle_penalty: oraclePenalty,
        penalty: ctx.wrongPenalty,
        shield_blocked: 0,
        finalShieldCount: 0
      },
    }
  }
}
