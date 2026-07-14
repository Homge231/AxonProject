import {
  BaseCore,
  getBasePoints,
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
  readonly coreName: string;
  readonly maxShields: number;
  readonly reflectDamage: boolean;
  readonly bastionMult: boolean;

  constructor(
    name: string = 'aegis shield',
    maxShields: number = 3,
    reflectDamage: boolean = false,
    bastionMult: boolean = false
  ) {
    super()
    this.coreName = name.toLowerCase()
    this.maxShields = maxShields
    this.reflectDamage = reflectDamage
    this.bastionMult = bastionMult
  }

  // Helper to calculate both current shields and consecutive correct streak
  private getShieldAndStreak(initialShields: number, history: boolean[]): { shields: number, streak: number } {
    let shields = initialShields
    let streak = 0

    const name = this.coreName
    const isShieldMission = name === 'shield mission'

    for (const isCorrect of history) {
      if (isCorrect) {
        shields = Math.min(shields + 1, this.maxShields)
        streak++
        if (isShieldMission && streak >= 3) {
          shields = this.maxShields
          streak = 0
        }
      } else {
        if (shields > 0) {
          shields = Math.max(0, shields - 1)
          if (isShieldMission) {
            // Shield Mission Special: streak does NOT break if protected by a shield
          } else {
            streak = 0
          }
        } else {
          streak = 0
        }
      }
    }

    return { shields, streak }
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    // Calculate shields right BEFORE this answer
    const historyBeforeThisAnswer = ctx.answerHistory.slice(0, -1)
    const currentShields = ctx.currentShields !== undefined 
      ? ctx.currentShields 
      : this.getShieldAndStreak(ctx.initialShieldCount || 0, historyBeforeThisAnswer).shields
    
    // Calculate final shields and streak after this answer
    const nextHistory = ctx.currentShields !== undefined ? [true] : ctx.answerHistory
    const { shields: finalShields, streak: finalStreak } = this.getShieldAndStreak(
      ctx.currentShields !== undefined ? ctx.currentShields : (ctx.initialShieldCount || 0), 
      nextHistory
    )
    
    const historyLower = ctx.historyCoreNames?.map(n => n.toLowerCase()) || []
    
    const hasBastionOfLight = this.bastionMult || historyLower.includes('bastion of light')
    const hasIndomitable = this.coreName === 'indomitable' || historyLower.includes('indomitable')
    const hasAegisNova = this.coreName === 'aegis nova' || historyLower.includes('aegis nova')
    const hasShieldSynergy = this.coreName === 'shield synergy' || historyLower.includes('shield synergy')

    let activeMultiplier = ctx.multiplierBuff
    if (hasBastionOfLight && currentShields === this.maxShields) {
      activeMultiplier *= 2
    }
    
    if (hasIndomitable) {
      activeMultiplier += (currentShields * 0.15)
    }

    let flatNova = 0
    if (hasAegisNova && currentShields === this.maxShields) {
      flatNova = 500
    }
    const synergyBonus = (hasShieldSynergy && currentShields === this.maxShields) ? 50 : 0

    const beforeMult = getBasePoints(ctx.targetWord) + ctx.flatBuff + flatNova + synergyBonus
    const total      = Math.floor(beforeMult * activeMultiplier) - oraclePenalty

    return {
      pointsDelta: total,
      breakdown: {
        base:            getBasePoints(ctx.targetWord),
        combo_bonus:     0,
        flat_buff:       ctx.flatBuff + flatNova + synergyBonus,
        multiplier_buff: activeMultiplier,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
        finalShieldCount: finalShields,
        mission_streak:  finalStreak
      },
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    
    // Calculate shields right BEFORE this wrong answer
    const historyBeforeThisAnswer = ctx.answerHistory.slice(0, -1)
    const currentShields = ctx.currentShields !== undefined 
      ? ctx.currentShields 
      : this.getShieldAndStreak(ctx.initialShieldCount || 0, historyBeforeThisAnswer).shields

    // Calculate final shields and streak after this wrong answer
    const nextHistory = ctx.currentShields !== undefined ? [false] : ctx.answerHistory
    const { shields: finalShields, streak: finalStreak } = this.getShieldAndStreak(
      ctx.currentShields !== undefined ? ctx.currentShields : (ctx.initialShieldCount || 0), 
      nextHistory
    )

    const historyLower = ctx.historyCoreNames?.map(n => n.toLowerCase()) || []

    if (currentShields > 0) {
      // Shield blocks the penalty!
      let reflectBonus = 0
      const hasSpikedShield = this.coreName === 'spiked shield' || historyLower.includes('spiked shield')
      const hasReflectDamage = this.reflectDamage || historyLower.includes('reflective aegis') || historyLower.includes('shield burst')
      
      if (hasSpikedShield) {
        reflectBonus = 200
      } else if (hasReflectDamage) {
        reflectBonus = 50
      }
      
      return {
        pointsDelta: reflectBonus - oraclePenalty,
        breakdown: {
          base: 0,
          combo_bonus: 0,
          flat_buff: reflectBonus,
          multiplier_buff: 1,
          oracle_penalty: oraclePenalty,
          penalty: 0,
          shield_blocked: 1,
          finalShieldCount: finalShields,
          mission_streak: finalStreak
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
        finalShieldCount: finalShields,
        mission_streak: finalStreak
      },
    }
  }
}
