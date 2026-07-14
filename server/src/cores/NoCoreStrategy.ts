import { BaseCore, getBasePoints, ScoringContext, ScoringResult } from './BaseCore'

/**
 * No Core / Default Core
 *
 * The baseline experience — no special buffs or penalties.
 * Score formula: floor( (getBasePoints(ctx.targetWord) + flat_buff) * multiplier_buff )
 *
 * flat_buff and multiplier_buff come from the DB row so even "No Core"
 * can be tuned via the database without touching code.
 */
export class NoCoreStrategy extends BaseCore {
  readonly coreName = 'no core'

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
}
