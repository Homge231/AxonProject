import {
  BaseCore,
  getBasePoints,
  ScoringContext,
  ScoringResult,
} from './BaseCore'

/**
 * Pandora's Box Core (Fallback)
 *
 * Pandora's Box is a meta-core. The frontend is responsible for shape-shifting
 * the active core and submitting the *shifted* core ID to the server.
 * 
 * However, if the player manages to submit an answer BEFORE the very first shift
 * occurs on the frontend, the server will receive the raw Pandora's Box core ID.
 * This strategy exists to handle that edge case gracefully and provide base points.
 */
export class PandoraCoreStrategy extends BaseCore {
  readonly coreName = "pandora's box"

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    // Formula: floor( (BASE + flat_buff) * multiplier_buff )
    const beforeMult = getBasePoints(ctx.targetWord) + ctx.flatBuff
    const total      = Math.floor(beforeMult * ctx.multiplierBuff) - oraclePenalty

    return {
      pointsDelta: total,
      breakdown: {
        base:            getBasePoints(ctx.targetWord),
        combo_bonus:     0,
        flat_buff:       ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
      },
    }
  }
}
