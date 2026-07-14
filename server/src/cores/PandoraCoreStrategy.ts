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
  readonly coreName: string;

  constructor(name: string = "pandora's box") {
    super()
    this.coreName = name.toLowerCase()
  }

  // Fallback if Pandora is somehow run directly
  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
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

  // Meta-core modifier applied on top of the secondary core's result
  applyModifiers(result: ScoringResult, isCorrect: boolean, ctx: ScoringContext, answer: string): ScoringResult {
    const newResult = { ...result, breakdown: { ...result.breakdown } }

    if (this.coreName === "trickster's glass") {
      if (!isCorrect && answer === '') {
        newResult.pointsDelta = 0
        newResult.breakdown.penalty = 0
        newResult.breakdown.oracle_penalty = 0
      }
    }

    if (this.coreName === 'chaos theory' && isCorrect) {
      const chaosPts = Math.floor(Math.random() * 401) + 100 // 100 to 500
      newResult.pointsDelta += chaosPts
      newResult.breakdown.flat_buff = (newResult.breakdown.flat_buff || 0) + chaosPts
    }

    if (this.coreName === 'butterfly effect' && isCorrect) {
      const bonusMult = 1 + (ctx.combo * 0.1)
      newResult.pointsDelta = Math.floor(newResult.pointsDelta * bonusMult)
      newResult.breakdown.multiplier_buff = (newResult.breakdown.multiplier_buff || 1) * bonusMult
    }

    if (this.coreName === 'cosmic entropy' && isCorrect) {
      const randMult = 1.0 + Math.random() * 4.0 // 1.0x to 5.0x
      newResult.pointsDelta = Math.floor(newResult.pointsDelta * randMult)
      newResult.breakdown.multiplier_buff = (newResult.breakdown.multiplier_buff || 1) * randMult
    }

    if (this.coreName === 'reality collapse' && isCorrect) {
      const isDoubled = Math.random() > 0.5
      const factor = isDoubled ? 2.0 : 0.5
      newResult.pointsDelta = Math.floor(newResult.pointsDelta * factor)
      newResult.breakdown.multiplier_buff = (newResult.breakdown.multiplier_buff || 1) * factor
    }

    return newResult
  }
}
