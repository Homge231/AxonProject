import { BaseCore, ScoringContext, ScoringResult } from './BaseCore'

export class BalancedCoreStrategy extends BaseCore {
  readonly coreName: string
  readonly immuneToPenalty: boolean

  constructor(name: string = 'balanced core', immuneToPenalty: boolean = false) {
    super()
    this.coreName = name.toLowerCase()
    this.immuneToPenalty = immuneToPenalty
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    
    if (this.immuneToPenalty) {
      return {
        pointsDelta: -oraclePenalty,
        breakdown: {
          base: 0,
          combo_bonus: 0,
          flat_buff: 0,
          multiplier_buff: 1,
          oracle_penalty: oraclePenalty,
          penalty: 0,
        },
      }
    }
    
    return super.calculateWrong(ctx)
  }
}
