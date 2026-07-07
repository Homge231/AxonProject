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

  // Helper to calculate the current shield count based on answer history
  private getShieldCount(initial: number, history: boolean[]): number {
    return history.reduce((shields, isCorrect) => {
      if (isCorrect) return Math.min(shields + 1, this.maxShields) // dynamic max shields
      return Math.max(0, shields - 1)
    }, initial)
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    // Bastion logic: if at max shields *before* this answer, double the points
    const historyBeforeThisAnswer = ctx.answerHistory.slice(0, -1)
    const currentShields = this.getShieldCount(ctx.initialShieldCount || 0, historyBeforeThisAnswer)
    
    let activeMultiplier = ctx.multiplierBuff
    if (this.bastionMult && currentShields === this.maxShields) {
      activeMultiplier *= 2
    }
    
    if (this.coreName === 'indomitable') {
      activeMultiplier += (currentShields * 0.15)
    }

    let flatNova = 0
    if (this.coreName === 'aegis nova' && currentShields === this.maxShields) {
      flatNova = 500
    }
    if (this.coreName === 'shield synergy' && currentShields === this.maxShields) {
      flatNova = 500 // Wait, description says +50 points. Let's make it 50!
    }
    const synergyBonus = (this.coreName === 'shield synergy' && currentShields === this.maxShields) ? 50 : 0

    const beforeMult = BASE_POINTS + ctx.flatBuff + flatNova + synergyBonus
    const total      = Math.floor(beforeMult * activeMultiplier) - oraclePenalty

    return {
      pointsDelta: total,
      breakdown: {
        base:            BASE_POINTS,
        combo_bonus:     0,
        flat_buff:       ctx.flatBuff + flatNova + synergyBonus,
        multiplier_buff: activeMultiplier,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
        finalShieldCount: this.getShieldCount(ctx.initialShieldCount || 0, ctx.answerHistory)
      },
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    
    // Calculate shields right BEFORE this wrong answer
    const historyBeforeThisAnswer = ctx.answerHistory.slice(0, -1)
    const currentShields = this.getShieldCount(ctx.initialShieldCount || 0, historyBeforeThisAnswer)

    if (currentShields > 0) {
      // Shield blocks the penalty!
      // Reflective Aegis: grant +50 points instead of losing
      // Spiked Shield: grant +200 points instead of losing
      let reflectBonus = 0
      if (this.coreName === 'spiked shield') {
        reflectBonus = 200
      } else if (this.reflectDamage) {
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
