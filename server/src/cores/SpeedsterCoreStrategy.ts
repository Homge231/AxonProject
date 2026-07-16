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
    let speedBonus      = Math.floor(speedRatio * SPEEDSTER_MULTIPLIER)
    
    let timerDelta = 0
    let pauseTimerMs = 0
    let shieldDelta = 0

    // Apply Core Effects
    if (this.coreName === 'warp speed') {
      speedBonus *= 3
    }
    if (this.coreName === 'sonic boom' && safeTaken < 1000) {
      speedBonus *= 4
    }

    let baseTotal = getBasePoints(ctx.targetWord) + speedBonus

    if (this.coreName === 'mach speed' && safeTaken < 2000) {
      baseTotal *= 2
    }
    if (this.coreName === 'overdrive') {
      baseTotal *= 2
    }

    if (this.coreName === 'time warp') {
      timerDelta = 2000
    }
    if (this.coreName === 'time freeze') {
      pauseTimerMs = 1000
    }
    if (this.coreName === 'speed shield' && safeTaken < 3000) {
      shieldDelta = 1
    }
    if (this.coreName === 'sonic boom') {
      const isCorrect = typeof ctx.wrongPenalty === 'number' && ctx.wrongPenalty > 0 ? false : true;
      if (isCorrect) {
        // Bonus is 5s * combo, max +30s
        timerDelta = Math.min(ctx.combo * 5000, 30000)
      } else {
        // Penalty is fixed -5s
        timerDelta = -5000
      }
    }
    if (this.coreName === 'speed demon' && safeTaken < 1500) {
      timerDelta = 3000
    }
    if (this.coreName === 'chronobreak') {
      if ((ctx.combo + 1) % 3 === 0) {
        pauseTimerMs = 3000
      }
    }

    const total = Math.floor(baseTotal * ctx.multiplierBuff) - oraclePenalty

    return {
      pointsDelta: Math.max(0, total),  // never go negative on a correct answer
      timerDelta: timerDelta > 0 ? timerDelta : undefined,
      pauseTimerMs: pauseTimerMs > 0 ? pauseTimerMs : undefined,
      shieldDelta: shieldDelta > 0 ? shieldDelta : undefined,
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

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)

    if (this.coreName === 'speed shield') {
      // Calculate current shields if not explicitly provided
      let currentShields = ctx.currentShields
      if (currentShields === undefined) {
        let shields = ctx.initialShieldCount || 0
        let streak = 0
        for (const isCorrect of ctx.answerHistory) {
          if (isCorrect) {
            streak++
            shields = Math.min(shields + 1, 3)
          } else {
            shields = Math.max(0, shields - 1)
            streak = 0
          }
        }
        currentShields = shields
      }

      if (currentShields > 0) {
        return {
          pointsDelta: -oraclePenalty, // consume a shield instead of normal penalty
          forgiveMistake: true,
          shieldDelta: -1,
          breakdown: {
            base: 0,
            combo_bonus: 0,
            flat_buff: 0,
            multiplier_buff: 1,
            oracle_penalty: oraclePenalty,
            penalty: 0,
            shield_blocked: 1,
            finalShieldCount: currentShields - 1
          }
        }
      }
    }

    if (this.coreName === 'sonic boom') {
      return {
        pointsDelta: -(ctx.wrongPenalty + oraclePenalty),
        timerDelta: -5000,
        breakdown: {
          base: 0,
          combo_bonus: 0,
          flat_buff: 0,
          multiplier_buff: 1,
          oracle_penalty: oraclePenalty,
          penalty: ctx.wrongPenalty,
        },
      }
    }

    return super.calculateWrong(ctx)
  }
}
