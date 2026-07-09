// ── Core Strategy — Base & Shared Types ───────────────────────────────────────
//
// HOW TO ADD A NEW CORE:
//   1. Create  server/src/cores/YourCoreStrategy.ts  (extend BaseCore)
//   2. Register it in  server/src/cores/index.ts     (one line)
//   Done — gameController.ts never needs to be touched.
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_POINTS             = 100
export const MATCH_DURATION_MS       = 90_000          // 90-second match
export const SPEEDSTER_MULTIPLIER    = 140             // max bonus pts from speed
export const SPEEDSTER_TIME_BUDGET_MS= 8_000           // 8-second window to get speed bonus
export const COMBO_BONUS_PER_STREAK  = 10              // +10 pts per combo level
export const MAX_COMBO_BONUS         = 100             // cap combo bonus at +100

// ── Shared types ──────────────────────────────────────────────────────────────

/**
 * Everything a core strategy needs to compute the score for one answer.
 * Passed in from gameController, assembled from request body + DB data.
 */
export interface ScoringContext {
  /** ms elapsed since the question was shown (sent by FE, 0 if unavailable) */
  timeTaken: number
  /** Full match duration in ms — used to normalise timeTaken */
  totalTime: number
  /** Current combo streak length at the time of answer */
  combo: number
  /** Pre-calculated wrong penalty (Levenshtein-based, 0 for correct answers) */
  wrongPenalty: number
  /** Oracle hint level used (0 = none) */
  oracleRevealLevel: number
  /** flat_buff column from DB for this core */
  flatBuff: number
  /** multiplier_buff column from DB for this core */
  multiplierBuff: number
  /** The sequence of correct/wrong answers in the current session (includes the current answer) */
  answerHistory: boolean[]
  /** Cross-round persistence: the player's shield count when the session started */
  initialShieldCount?: number
  /** Names of all cores in the session's upgrade/history stack */
  historyCoreNames?: string[]
}

/**
 * What every core strategy must return from both calculateCorrect / calculateWrong.
 */
export interface ScoringResult {
  /** Net change to the player's total score (negative = deduction) */
  pointsDelta: number
  /** Fine-grained breakdown sent to the client for display/debugging */
  breakdown: {
    base: number
    combo_bonus: number
    flat_buff: number
    multiplier_buff: number
    oracle_penalty: number
    penalty: number
    /** Any extra fields a specific core wants to surface */
    [key: string]: number
  }
}

// ── Abstract base ─────────────────────────────────────────────────────────────

export abstract class BaseCore {
  /** Must match the `name` column in the `cores` DB table (case-insensitive) */
  abstract readonly coreName: string

  /**
   * Called when the player answers CORRECTLY.
   * Every core must implement its own reward formula here.
   */
  abstract calculateCorrect(ctx: ScoringContext): ScoringResult

  /**
   * Called when the player answers WRONGLY / skips.
   * Default: deduct the Levenshtein-based penalty.
   * Override in a child class if the core changes wrong-answer behaviour.
   */
  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    return {
      pointsDelta: -(ctx.wrongPenalty + oraclePenalty),
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

  // ── Protected helpers shared by child strategies ───────────────────────────

  /**
   * Cumulative oracle penalty for using the reveal feature.
   * Costs: Lv1 = -10, Lv2 = -30 (cumulative), Lv3 = -60 (cumulative).
   */
  protected _oraclePenalty(ctx: ScoringContext): number {
    if (ctx.oracleRevealLevel <= 0) return 0

    // If an upgraded Oracle core is present in history, hints are free
    if (ctx.historyCoreNames) {
      const upgradedOracleNames = [
        'clairvoyance', 'third eye', 'future sight', 'divine guidance', 'oracle blessing',
        'omniscience', 'mind reader', 'predictive strike', 'cosmic wisdom', 'divine eye'
      ]
      const hasUpgradedOracle = ctx.historyCoreNames.some(name =>
        upgradedOracleNames.includes(name.toLowerCase())
      )
      if (hasUpgradedOracle) return 0
    }

    const cumulativeCosts = [10, 30, 60]
    const idx = Math.min(Math.max(ctx.oracleRevealLevel, 1), cumulativeCosts.length) - 1
    return cumulativeCosts[idx]
  }
}
