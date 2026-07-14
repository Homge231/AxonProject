import {
  BaseCore,
  getBasePoints,
  SPEEDSTER_MULTIPLIER,
  SPEEDSTER_TIME_BUDGET_MS,
  ScoringContext,
  ScoringResult,
} from './BaseCore'

/**
 * Speedster Core  (US-17.1)
 *
 * Rewards players who answer quickly. The faster the answer, the higher the bonus.
 * Flat 100-point base is replaced entirely by a time-based formula with a strict time window.
 *
 * Formula:
 *   speedBonus = max(0, floor( (1 - timeTaken / budget) * SPEEDSTER_MULTIPLIER ))
 *   total      = getBasePoints(ctx.targetWord) + speedBonus
 *
 * Examples (SPEEDSTER_MULTIPLIER = 150, budget = 8000 ms):
 *   Answer in  1s  →  +131 bonus  → 231 pts
 *   Answer in  3s  →  +93 bonus   → 193 pts
 *   Answer in  6s  →  +37 bonus   → 137 pts
 *   Answer in  8s+ →  +0 bonus    → 100 pts
 *
 * The combo streak and flat_buff / multiplier_buff are intentionally ignored —
 * speed is the ONLY axis that matters for this core.
 */
export class SpeedsterCoreStrategy extends BaseCore {
  readonly coreName: string;

  constructor(name: string = 'speedster') {
    super()
    this.coreName = name.toLowerCase()
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)

    // Clamp timeTaken to guard against clock drift or missing data
    const safeTaken     = Math.max(ctx.timeTaken, 0)
    const speedRatio    = Math.max(0, 1 - safeTaken / SPEEDSTER_TIME_BUDGET_MS) // 1.0 = instant, 0.0 = budget exhausted
    const speedBonus    = Math.floor(speedRatio * SPEEDSTER_MULTIPLIER)
    const baseTotal     = getBasePoints(ctx.targetWord) + speedBonus
    const total         = Math.floor(baseTotal * ctx.multiplierBuff) - oraclePenalty

    return {
      pointsDelta: Math.max(0, total),  // never go negative on a correct answer
      breakdown: {
        base:            getBasePoints(ctx.targetWord),
        combo_bonus:     0,             // Speedster ignores combo
        flat_buff:       ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
        speed_bonus:     speedBonus,    // extra field surfaced in the response
        time_taken_ms:   ctx.timeTaken,
      },
    }
  }
}
