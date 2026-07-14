import {
  BaseCore,
  getBasePoints,
  COMBO_BONUS_PER_STREAK,
  MAX_COMBO_BONUS,
  ScoringContext,
  ScoringResult,
} from './BaseCore'

/**
 * Combo Core
 *
 * Rewards players for maintaining an answer streak.
 * Formula: floor( (BASE + comboBonus + flat_buff) * multiplier_buff )
 *
 * comboBonus = min(combo * COMBO_BONUS_PER_STREAK, MAX_COMBO_BONUS)
 *   → combo 1  = +10, combo 5  = +50, combo 10+ = +100 (capped)
 */
export class ComboCoreStrategy extends BaseCore {
  readonly coreName: string;
  readonly maxBonus: number;

  constructor(name: string = 'combo core', maxBonus: number = MAX_COMBO_BONUS) {
    super()
    this.coreName = name.toLowerCase()
    this.maxBonus = maxBonus
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    let maxBonus = this.maxBonus
    let bonusPerStreak = COMBO_BONUS_PER_STREAK

    if (this.coreName === 'radiant combo') maxBonus = 200
    if (this.coreName === 'prismatic combo') maxBonus = 300
    if (this.coreName === 'golden combo') {
      maxBonus = 500
      bonusPerStreak *= 2
    }

    if (this.coreName === 'combo focus') bonusPerStreak = 10

    let comboBonus = Math.min(ctx.combo * bonusPerStreak, maxBonus)
    
    let timerDelta = 0
    let shieldDelta = 0
    let activeMultiplier = ctx.multiplierBuff

    if (this.coreName === 'combo time' && ctx.combo >= 1) {
      timerDelta = 1000 // +1s for correct answers during combo
    }

    if (this.coreName === 'combo multiplier') {
      activeMultiplier += Math.min(ctx.combo * 0.1, 1.0)
    }

    if (this.coreName === 'combo shield') {
      // "+1 Aegis Shield stack for every 3 combo streak"
      if (ctx.combo > 0 && (ctx.combo + 1) % 3 === 0) {
        shieldDelta = 1
      }
    }

    if (this.coreName === 'super combo' && (ctx.combo + 1) >= 5) {
      activeMultiplier *= 2.5
    }

    const beforeMult    = getBasePoints(ctx.targetWord) + comboBonus + ctx.flatBuff
    const total         = Math.floor(beforeMult * activeMultiplier) - oraclePenalty

    return {
      pointsDelta: total,
      timerDelta: timerDelta > 0 ? timerDelta : undefined,
      shieldDelta: shieldDelta > 0 ? shieldDelta : undefined,
      breakdown: {
        base:            getBasePoints(ctx.targetWord),
        combo_bonus:     comboBonus,
        flat_buff:       ctx.flatBuff,
        multiplier_buff: activeMultiplier,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
      },
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    
    if (this.coreName === 'combo focus') {
      return {
        pointsDelta: -(ctx.wrongPenalty + 30 + oraclePenalty),
        breakdown: {
          base: 0,
          combo_bonus: 0,
          flat_buff: -30,
          multiplier_buff: 1,
          oracle_penalty: oraclePenalty,
          penalty: ctx.wrongPenalty,
        },
      }
    }

    return super.calculateWrong(ctx)
  }
}
