import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { runScoring, getCoreStrategy } from '../cores/index'
import { getUpgradesForCore, getCoreFamily } from '../cores/families'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// ── Constants ─────────────────────────────────────────────────────────────────
const MATCH_DURATION_MS = 100_000                             // 100-second match
const PANDORA_CORE_ID = '00000000-0000-0000-0000-000000000010' // Pandora's Box

// In-memory timer store for Anti-Cheat (time_taken validation)
const sessionTimers = new Map<string, number>()

const TYPO_ACCURACY_THRESHOLD = 0.8   // >= 80% similarity counts as a "typo"
const TYPO_PENALTY_PER_LETTER = 2     // -2 pts per wrong letter for close misses
const WRONG_PENALTY_PER_CHAR = 10     // -10 pts per wrong/missing character for standard misses
const MIN_WRONG_PENALTY = 10          // floor — even a 1-character miss costs at least this much
const MAX_WRONG_PENALTY = 50          // ceiling — caps penalty for a full skip / completely unrelated guess

// ── Types ─────────────────────────────────────────────────────────────────────
interface CoreRow {
  id: string
  name: string
  flat_buff: number
  multiplier_buff: number
  core_type: 'main' | 'upgrade'
  classification: 'power' | 'effect'
  tier?: number
}

type PenaltyType = 'typo' | 'wrong' | null

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeAnswer(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

/**
 * Classic Levenshtein edit-distance (insert/delete/substitute), O(m*n).
 * Used to measure how close `typed` is to `target`.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        )
      }
    }
  }

  return dp[m][n]
}

/**
 * Accuracy as a 0..1 ratio: 1 - (edit_distance / longer_word_length).
 * An empty typed word (skip) always yields accuracy 0.
 */
function calculateAccuracy(typed: string, target: string): { distance: number; accuracy: number } {
  if (typed.length === 0 || target.length === 0) {
    return { distance: Math.max(typed.length, target.length), accuracy: 0 }
  }
  const distance = levenshteinDistance(typed, target)
  const maxLen = Math.max(typed.length, target.length)
  const accuracy = maxLen === 0 ? 0 : 1 - distance / maxLen
  return { distance, accuracy }
}

/**
 * Determines the penalty for a wrong answer, scaled proportionally to how many
 * characters differ from the target (Levenshtein edit distance). No flat
 * deduction is ever applied — the penalty always grows with the error margin.
 *
 *  - High accuracy (>= 80%, non-empty submission) → "typo": -2 pts per wrong letter
 *  - Low accuracy (< 80%) or empty/skip           → "wrong": -10 pts per wrong letter,
 *                                                     capped at MAX_WRONG_PENALTY so a
 *                                                     totally unrelated guess or a full
 *                                                     skip doesn't wipe out the score.
 */
function getWrongAnswerPenalty(
  typed: string,
  target: string
): { penalty: number; penaltyType: PenaltyType; accuracy: number; distance: number } {
  const { distance, accuracy } = calculateAccuracy(typed, target)

  const isSkip = typed.length === 0
  if (!isSkip && accuracy >= TYPO_ACCURACY_THRESHOLD) {
    const penalty = Math.max(1, distance * TYPO_PENALTY_PER_LETTER)
    return { penalty, penaltyType: 'typo', accuracy, distance }
  }

  // Proportional to the number of wrong characters; a full skip is treated as
  // the worst case (distance == target length) and is naturally capped below.
  const effectiveDistance = isSkip ? target.length : distance
  const penalty = Math.min(
    MAX_WRONG_PENALTY,
    Math.max(MIN_WRONG_PENALTY, effectiveDistance * WRONG_PENALTY_PER_CHAR)
  )
  return { penalty, penaltyType: 'wrong', accuracy, distance: effectiveDistance }
}

// NOTE: calculateScore() has been removed.
// Scoring is now delegated to the core strategy registry — see server/src/cores/index.ts
// To add a new core: create a strategy file + register it in cores/index.ts.

// ── Endpoint: GET /api/game/question (legacy) removed ───────────────────────

function generateOracleHints(word: string): string[] {
  if (!word) return ['', '', '']
  const len = word.length
  const getHintForLevel = (level: number) => {
    const revealed = new Set<number>()
    if (level >= 1) {
      revealed.add(0)
      if (len > 1) revealed.add(len - 1)
    }
    if (level >= 2) {
      const targetReveal = Math.min(len - 1, Math.max(Math.min(len, revealed.size + 1), Math.ceil(len * 0.5)))
      let count = revealed.size
      const interval = (len - 1) / (targetReveal - 1)
      for (let k = 1; k < targetReveal - 1 && count < targetReveal; k++) {
        const index = Math.min(len - 2, Math.max(1, Math.round(k * interval)))
        if (!revealed.has(index)) {
          revealed.add(index)
          count++
        }
      }
      let fallback = 1
      while (count < targetReveal && fallback < len - 1) {
        if (!revealed.has(fallback)) { revealed.add(fallback); count++ }
        fallback++
      }
    }
    if (level >= 3) {
      const targetReveal = Math.min(len - 1, Math.max(Math.min(len, revealed.size + 1), Math.ceil(len * 0.7)))
      let count = revealed.size
      const interval = (len - 1) / (targetReveal - 1)
      for (let k = 1; k < targetReveal - 1 && count < targetReveal; k++) {
        const index = Math.min(len - 2, Math.max(1, Math.round(k * interval)))
        if (!revealed.has(index)) {
          revealed.add(index)
          count++
        }
      }
      let fallback = 1
      while (count < targetReveal && fallback < len - 1) {
        if (!revealed.has(fallback)) { revealed.add(fallback); count++ }
        fallback++
      }
    }
    return word.split('').map((ch, i) => revealed.has(i) ? ch.toUpperCase() : '\u00b7').join(' ')
  }
  return [getHintForLevel(1), getHintForLevel(2), getHintForLevel(3)]
}

// ── Endpoint: GET /api/game/questions ────────────────────────────────────────
export async function getQuestions(req: AuthRequest, res: Response): Promise<void> {
  const BATCH_SIZE = 20
  try {
    const { topic } = req.query
    let query = supabase.from('questions').select('id')
    if (topic && typeof topic === 'string') {
      query = query.eq('topic', topic)
    }
    const { data: ids, error: idError } = await query
    if (idError) throw idError
    if (!ids || ids.length === 0) { res.status(404).json({ error: 'No questions available.' }); return }

    const shuffled = [...ids].sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE)
    const pickedIds = shuffled.map((r: { id: string }) => r.id)

    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, question_text, target_word, hint, topic')
      .in('id', pickedIds)

    if (qError) throw qError
    
    // Mask the payload to avoid information disclosure
    const maskedQuestions = (questions ?? []).map(q => {
      const { target_word, ...rest } = q
      return {
        ...rest,
        target_length: target_word?.length || 0,
        target_hash: target_word ? crypto.createHash('sha256').update(target_word.toLowerCase()).digest('hex') : '',
        oracle_hints: generateOracleHints(target_word)
      }
    })
    
    const shuffledQuestions = maskedQuestions.sort(() => Math.random() - 0.5)
    res.status(200).json({ questions: shuffledQuestions })
  } catch (err) {
    console.error('getQuestions error:', err)
    res.status(500).json({ error: 'Failed to fetch questions.' })
  }
}

// ── Endpoint: GET /api/game/cores ─────────────────────────────────────────────
export async function getCores(req: AuthRequest, res: Response): Promise<void> {
  try {
    const previous_core_id = req.query.previous_core_id as string | undefined

    const { data: allCores, error } = await supabase
      .from('cores')
      .select('id, name, description, flat_buff, multiplier_buff, tier, upgrades_to, core_type, classification, icon_url')

    if (error) throw error
    if (!allCores || allCores.length === 0) {
      res.status(200).json({ cores: [] })
      return
    }

    if (req.query.all === 'true') {
      res.status(200).json({ cores: allCores })
      return
    }

    const tier1Cores = allCores.filter(c => c.tier === 1 || !c.tier)
    
    let offeredCores: any[] = []

    if (!previous_core_id) {
      // Round 1: Return all Tier 1 cores so the client can select and reroll
      offeredCores = tier1Cores
    } else {
      // Round 2 or 3
      const prevCore = allCores.find(c => c.id === previous_core_id)
      if (prevCore) {
        const targetTier = (prevCore.tier === 1) ? 2 : (prevCore.tier === 2 ? 3 : 2)
        const upgradeNames = getUpgradesForCore(prevCore.name, targetTier)
        
        if (upgradeNames.length > 0) {
          const synergyPool = allCores.filter(c => 
            upgradeNames.some(name => name.toLowerCase() === c.name.toLowerCase())
          )
          
          if (synergyPool.length > 0) {
            const shuffledPool = [...synergyPool].sort(() => 0.5 - Math.random())
            offeredCores = shuffledPool.slice(0, 3)
          }
        }
      }

      // Fallback if no synergy upgrades found
      if (offeredCores.length === 0) {
        const prevCore = allCores.find(c => c.id === previous_core_id)
        let synergyCore: any = null
        if (prevCore && prevCore.upgrades_to) {
          synergyCore = allCores.find(c => c.id === prevCore.upgrades_to)
        }
        let pool = tier1Cores.filter(c => c.id !== previous_core_id)
        if (pool.length === 0) pool = tier1Cores
        const shuffledPool = [...pool].sort(() => 0.5 - Math.random())
        if (synergyCore) {
          offeredCores = [synergyCore, shuffledPool[0]]
        } else {
          offeredCores = [shuffledPool[0], shuffledPool[1]]
        }
      }
    }

    res.status(200).json({ cores: offeredCores })
  } catch (err) {
    console.error('getCores error:', err)
    res.status(500).json({ error: 'Failed to fetch cores.' })
  }
}

// ── Endpoint: POST /api/game/session ──────────────────────────────────────────
export async function createSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const playerId = req.user!.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { active_core_id } = req.body

    if (!active_core_id) {
      res.status(400).json({ error: 'active_core_id is required.' })
      return
    }

    const { data: core, error: coreErr } = await supabase
      .from('cores')
      .select('id, name, tier')
      .eq('id', active_core_id)
      .single()

    if (coreErr || !core) {
      res.status(400).json({ error: 'Invalid active_core_id: core not found.' })
      return
    }

    // Verify initial core tier is 1
    if (core.tier !== 1 && core.tier !== null) {
      res.status(400).json({ error: 'Initial core must be a Tier 1 core.' })
      return
    }

    const { data: player } = await supabase
      .from('players')
      .select('username, avatar_url')
      .eq('id', playerId)
      .single()

    const finalAvatarUrl = player?.avatar_url?.trim()
      || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player?.username || 'Player'}`

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({ 
        player_id: playerId, 
        status: 'active', 
        active_core_id: active_core_id
      })
      .select('id')
      .single()

    if (error) throw error

    const themes = ['daily-life', 'cafe', 'travel']
    const randomTheme = themes[Math.floor(Math.random() * themes.length)]

    // Start anti-cheat timer for the first question (adding 3s buffer for countdown)
    sessionTimers.set(data.id, Date.now() + 3000)

    res.status(201).json({
      session_id: data.id,
      theme: randomTheme,
      avatar_url: finalAvatarUrl,
      active_core: { id: core.id, name: core.name }
    })
  } catch (err) {
    console.error('createSession error:', err)
    res.status(500).json({ error: 'Failed to create session.' })
  }
}

// ── Endpoint: POST /api/game/submit-answer ────────────────────────────────────
/**
 * Receives:  { session_id, question_id, answer, time_taken?, current_combo, active_core_id }
 * Validates: active_core_id matches game_sessions.active_core_id (anti-cheat)
 * Calculates:
 *   correct → ((Base + ComboBonus) + FlatBuff) * MultiplierBuff
 *             ComboBonus only applies when the active core is "Combo Core" — all other
 *             cores ignore current_combo entirely, regardless of streak length.
 *   wrong   → Levenshtein-based similarity check, fully proportional (never flat):
 *               accuracy >= 80%  → dynamic "typo" penalty (-2 pts per wrong letter)
 *               accuracy < 80%   → proportional "wrong" penalty (-10 pts per wrong letter, clamped 10–50)
 * Returns:   { status, correct, points_earned, points_deducted, penalty_type, accuracy,
 *              current_total_score, questions_answered, breakdown }
 */
export async function submitAnswer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const playerId = req.user!.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { 
      session_id, 
      question_id, 
      answer, 
      time_taken, 
      current_combo, 
      active_core_id, 
      oracle_reveal_level,
      core_history_names,
      secondary_core_id,
      player_id,
      current_shields,
      mission_progress
    } = req.body

    if (player_id && player_id !== playerId) {
      res.status(403).json({ error: 'player_id does not match authenticated user.' })
      return
    }

    const oracleRevealLevel = typeof oracle_reveal_level === 'number' && oracle_reveal_level >= 0
      ? Math.floor(oracle_reveal_level)
      : 0

    // ── 1. Input validation ───────────────────────────────────────────────────
    if (!session_id || !question_id || typeof answer !== 'string') {
      res.status(400).json({ error: 'session_id, question_id and answer are required.' })
      return
    }

    // ── 2. Fetch session (verify ownership & status) ──────────────────────────
    const { data: session, error: sessErr } = await supabase
      .from('game_sessions')
      .select('id, status, score, questions_answered, active_core_id, cores:active_core_id(name)')
      .eq('id', session_id)
      .eq('player_id', playerId)
      .single()

    if (sessErr || !session) {
      res.status(404).json({ error: 'Session not found.' })
      return
    }
    if (session.status !== 'active') {
      res.status(409).json({ error: 'Session already ended.' })
      return
    }

    // ── 3. Anti-cheat: validate submitted core matches session core ────────────
    const sessionCoreId = session.active_core_id
    const submittedCoreId = active_core_id
    const sessionCoreName = (session.cores as any)?.name?.toLowerCase() || ''

    const isPandora = getCoreFamily(sessionCoreName) === 'pandora'

    if (!sessionCoreId || !submittedCoreId) {
      res.status(400).json({ error: 'Missing core ID.' })
      return
    }

    // ── 4. Fetch core buffs ───────────────────────────────────────────────────
    const { data: coreRow, error: coreErr } = await supabase
      .from('cores')
      .select('id, name, flat_buff, multiplier_buff, core_type, classification, tier')
      .eq('id', sessionCoreId)
      .single()

    if (coreErr || !coreRow) {
      res.status(500).json({ error: 'Failed to load core data.' })
      return
    }

    const core: CoreRow = coreRow as CoreRow

    // ── 3. Anti-cheat: validate submitted core matches session core ──
    if (sessionCoreId !== submittedCoreId) {
      res.status(403).json({ error: 'Core mismatch detected! (Anti-cheat triggered)' })
      return
    }

    // Handle Pandora's Box shifted core fetching
    let secondaryCore: CoreRow | null = null
    if (isPandora && secondary_core_id) {
      const { data: secCore } = await supabase
        .from('cores')
        .select('id, name, flat_buff, multiplier_buff, core_type, classification, tier')
        .eq('id', secondary_core_id)
        .single()
      
      if (secCore) {
        secondaryCore = secCore as CoreRow
        
        // Anti-cheat: Validate that the shifted core is a valid Tier 1 main core
        const family = getCoreFamily(secondaryCore.name)
        if (secondaryCore.tier !== 1 || secondaryCore.core_type !== 'main' || family === 'pandora') {
          res.status(403).json({ error: 'Cheat detected: Shifted core is not a valid Tier 1 main core or is a Pandora variant.' })
          return
        }
      }
    }

    // ── 5. Fetch question & evaluate answer ──────────────────────────────────
    const { data: question, error: qErr } = await supabase
      .from('questions')
      .select('target_word')
      .eq('id', question_id)
      .single()

    if (qErr || !question) {
      res.status(404).json({ error: 'Question not found.' })
      return
    }

    const normalizedAnswer = normalizeAnswer(answer)
    const normalizedTarget = normalizeAnswer(question.target_word)
    const isCorrect = normalizedAnswer === normalizedTarget

    // ── 6. Calculate similarity-based penalty for wrong answers ───────────────
    let penaltyType: PenaltyType = null
    let accuracy = 1
    let wrongPenalty = 0

    if (!isCorrect) {
      const result = getWrongAnswerPenalty(normalizedAnswer, normalizedTarget)
      wrongPenalty = result.penalty
      penaltyType = result.penaltyType
      accuracy = result.accuracy
    }

    // ── 7. Fetch answer history for pattern-based cores ───────────────────────
    let answerHistory: boolean[] = []
    
    // Only stack cores that belong to the SAME family as the active core
    const activeFamily = getCoreFamily(core.name)
    let historyCoreNames = Array.isArray(core_history_names) ? [...core_history_names] : []
    
    if (activeFamily) {
      historyCoreNames = historyCoreNames.filter(n => getCoreFamily(n) === activeFamily)
    } else {
      historyCoreNames = historyCoreNames.filter(n => n === core.name)
    }
    
    // Ensure the active core is always included
    if (!historyCoreNames.includes(core.name)) {
      historyCoreNames.push(core.name)
    }
      
    // Include secondaryCore if it exists (for Chaos Theory)
    if (secondaryCore && !historyCoreNames.includes(secondaryCore.name)) {
      historyCoreNames.push(secondaryCore.name)
    }

    const needsHistory = historyCoreNames.some(name => {
      const strategy = getCoreStrategy(name)
      return strategy.constructor.name === 'AegisCoreStrategy' || 
             strategy.constructor.name === 'MissionCoreStrategy' ||
             strategy.constructor.name === 'PhoenixCoreStrategy' ||
             strategy.constructor.name === 'ComboCoreStrategy' ||
             name.toLowerCase() === 'speed shield' ||
             // Harmony Wave needs history to count wrong answers for its 2-miss immunity
             name.toLowerCase() === 'harmony wave'
    })
    
    if (needsHistory) {
      const { data: historyData } = await supabase
        .from('game_session_answers')
        .select('correct')
        .eq('session_id', session_id)
        .order('created_at', { ascending: true })
      
      if (historyData) {
        answerHistory = historyData.map(r => r.correct)
      }
    }
    // Calculate combo strictly from server history (ignore client current_combo)
    const historyBeforeThisAnswer = answerHistory.slice() // copy array before pushing current answer
    let serverCombo = 0
    for (const isCorr of historyBeforeThisAnswer) {
      if (isCorr) serverCombo++
      else serverCombo = 0
    }

    answerHistory.push(isCorrect)

    // ── 8. Calculate score via core strategy registry ────────────────────────
    
    // Anti-Cheat: Validate time_taken against actual server-side time
    const now = Date.now()
    const lastTime = sessionTimers.get(session_id) || now
    const actualTimeTaken = Math.max(0, now - lastTime)
    
    let serverTimeTaken = typeof time_taken === 'number' && time_taken >= 0 ? Math.floor(time_taken) : 0
    // If client claims a time much faster than physically possible on the server, clamp it.
    // Allow a 1500ms grace period for network latency and rendering.
    if (serverTimeTaken < actualTimeTaken - 1500) {
      serverTimeTaken = Math.max(0, actualTimeTaken - 1500)
    }
    sessionTimers.set(session_id, now)

    // Fetch details of all cores in the family history
    const { data: dbCores } = await supabase
      .from('cores')
      .select('id, name, flat_buff, multiplier_buff, core_type, classification, tier')
      .in('name', historyCoreNames)
    let coreRows = (dbCores && dbCores.length > 0 ? dbCores : [core]) as CoreRow[]

    // Anti-Cheat: Validate and sanitize historyCoreNames to ensure only ONE core per tier
    const sanitizedHistoryNames: string[] = []
    const seenTiers = new Set<number>()
    // Sort coreRows by tier descending so the highest tier (active core) gets priority
    coreRows.sort((a, b) => (b.tier || 1) - (a.tier || 1))
    
    for (const r of coreRows) {
      if (r.name === core.name || r.name === secondaryCore?.name) {
         sanitizedHistoryNames.push(r.name)
         seenTiers.add(r.tier || 1)
      } else if (!seenTiers.has(r.tier || 1)) {
         sanitizedHistoryNames.push(r.name)
         seenTiers.add(r.tier || 1)
      }
    }
    historyCoreNames = sanitizedHistoryNames
    coreRows = coreRows.filter(r => sanitizedHistoryNames.includes(r.name))

    // ── Apply Hybrid / Replacement Matrix ──
    const t2Core = coreRows.find(c => c.tier === 2)
    const t3Core = coreRows.find(c => c.tier === 3)
    let isHybrid = false

    if (t2Core && t3Core) {
      if (t2Core.classification === t3Core.classification) {
        // Replacement Matrix: Power->Power or Effect->Effect. Old core is completely discarded.
        historyCoreNames = historyCoreNames.filter(name => name !== t2Core.name)
        coreRows = coreRows.filter(c => c.id !== t2Core.id)
      } else {
        // Hybrid Matrix: Power->Effect or Effect->Power. Both are kept!
        isHybrid = true
      }
    }

    // Determine the primary scoring core.
    let scoringCore = core
    
    // In Hybrid Mode (T2 + T3), if we aren't Pandora, power cores take priority for formula
    if (!secondaryCore) {
      const powerCores = coreRows.filter(r => r.classification === 'power')
      if (powerCores.length > 0) {
        // Pick the most recent power core in history
        scoringCore = powerCores.sort((a, b) => historyCoreNames.indexOf(b.name) - historyCoreNames.indexOf(a.name))[0]
      }
    }
    
    // In Hybrid mode, combine the raw DB buffs of both T2 and T3.
    let activeFlatBuff = scoringCore.flat_buff
    let activeMultBuff = scoringCore.multiplier_buff
    if (isHybrid && t2Core && t3Core) {
      // Avoid double-counting scoringCore
      const otherCore = scoringCore.id === t3Core.id ? t2Core : t3Core
      activeFlatBuff += otherCore.flat_buff
      activeMultBuff *= otherCore.multiplier_buff
    }

    // Check if the current core grants initial shields
    let initialShieldCount = 0
    const activeLower = core.name.toLowerCase()
    if (activeLower === 'guardian angel') {
      initialShieldCount = 3
    } else if (activeLower === 'shield battery') {
      initialShieldCount = 2
    }

    const ctx = {
      timeTaken:         serverTimeTaken,
      totalTime:         MATCH_DURATION_MS,
      combo:             serverCombo,
      wrongPenalty,
      oracleRevealLevel,
      flatBuff:          activeFlatBuff,
      multiplierBuff:    activeMultBuff,
      answerHistory,
      initialShieldCount,
      historyCoreNames,
      currentShields:    typeof current_shields === 'number' ? current_shields : undefined,
      missionProgress:   typeof mission_progress === 'number' ? mission_progress : undefined,
      secondaryCoreName: secondaryCore?.name,
      targetWord:        question.target_word
    }

    // Always run the primary scoring core logic
    let scoringResult = runScoring(isCorrect, scoringCore.name, ctx)

    // Apply Pandora specific modifiers on top if the active core is a Pandora core
    if (core.name !== scoringCore.name) {
      const pandoraStrategy = getCoreStrategy(core.name) as any
      if (typeof pandoraStrategy.applyModifiers === 'function') {
        scoringResult = pandoraStrategy.applyModifiers(scoringResult, isCorrect, ctx, normalizedAnswer)
      }
    }

    let pointsDelta = scoringResult.pointsDelta
    let breakdown = scoringResult.breakdown
    let timerDelta = scoringResult.timerDelta
    let forgiveMistake = scoringResult.forgiveMistake
    let lockInputMs = scoringResult.lockInputMs
    let pauseTimerMs = scoringResult.pauseTimerMs

    // Stack Mission progress if there is a Mission core in history
    const missionCoreName = historyCoreNames.find(name => getCoreStrategy(name).constructor.name === 'MissionCoreStrategy')
    if (missionCoreName && missionCoreName !== scoringCore.name) {
      const missionResult = runScoring(isCorrect, missionCoreName, ctx)
      breakdown.mission_streak = missionResult.breakdown.mission_streak
      if (isCorrect && missionResult.breakdown.mission_completed === 1) {
        breakdown.mission_completed = 1
        const missionBonus = missionResult.breakdown.flat_buff
        pointsDelta += missionBonus
        breakdown.flat_buff += missionBonus
      }
    }

    // If there is an Aegis core in history (or they have ghost shields from Pandora) that would block damage, let it override the primary penalty!
    if (!isCorrect) {
      let aegisCore = historyCoreNames.find(name => getCoreStrategy(name).constructor.name === 'AegisCoreStrategy')
      // If Pandora shifted away from Aegis Shield but the player still has earned shields, default to Aegis Shield logic to block the damage
      if (!aegisCore && ctx.currentShields && ctx.currentShields > 0) {
        aegisCore = "aegis shield"
      }
      
      if (aegisCore && aegisCore !== scoringCore.name) {
         const aegisResult = runScoring(isCorrect, aegisCore, ctx)
         if (aegisResult.breakdown.shield_blocked) {
           // Shield successfully blocked! Override the penalty result.
           pointsDelta = aegisResult.pointsDelta
           breakdown = aegisResult.breakdown
         }
      }
    }

    // ── Apply Pandora Base Passive Effects ────────────────────────────────────
    if (isPandora) {
      const baseName = sessionCoreName.toLowerCase()
      
      if (baseName === "pandora's curse") {
        if (isCorrect) pointsDelta *= 2
        else pointsDelta = -Math.abs(pointsDelta) * 2
      } 
      else if (baseName === "pandora's mirror") {
        if (!isCorrect && penaltyType === 'typo') {
          // Reflects close typos as positive points
          pointsDelta = Math.abs(pointsDelta)
        }
      } 
      else if (baseName === "trickster's glass") {
        // Passive: wrong answers deal only half the usual penalty
        if (!isCorrect) {
          pointsDelta = Math.ceil(pointsDelta / 2) // pointsDelta is negative, ceil = less damage
        }
      }
      else if (baseName === "butterfly effect") {
        // Passive: high combo (5+) doubles points on a correct answer
        if (isCorrect && serverCombo >= 5) {
          pointsDelta = Math.floor(pointsDelta * 2.0)
          breakdown.multiplier_buff = (breakdown.multiplier_buff || 1) * 2.0
        }
      }
      else if (baseName === "chaos prism") {
        if (isCorrect) pointsDelta += 50
      } 
      else if (baseName === "warp reality") {
        if (isCorrect) pointsDelta = Math.floor(pointsDelta * 1.5)
      } 
      else if (baseName === "cosmic entropy") {
        if (isCorrect) {
          const mult = 1.0 + Math.random() * 4.0
          pointsDelta = Math.floor(pointsDelta * mult)
        }
      } 
      else if (baseName === "reality collapse") {
        if (isCorrect) {
          pointsDelta = Math.random() > 0.5 ? pointsDelta * 2 : Math.floor(pointsDelta / 2)
        }
      } 
      else if (baseName === "pandora's wrath") {
        if (isCorrect) {
          // Correct answers give +500 flat points
          pointsDelta += 500
          breakdown.flat_buff = (breakdown.flat_buff || 0) + 500
        } else {
          // Destroys incorrect answers, granting flat +200 points instead of losing points.
          pointsDelta = 200
        }
      }
    }

    // ── 9. Record the answer (unique per session+question) ────────────────────
    const { error: answerErr } = await supabase
      .from('game_session_answers')
      .insert({
        session_id,
        player_id: playerId,
        question_id,
        answer,
        correct: isCorrect,
        points_delta: pointsDelta
      })

    if (answerErr) {
      if (answerErr.code === '23505') {
        // Question already answered in this session (e.g. drawn again in a later round).
        // Skip inserting into history, but still allow scoring and progression.
        console.warn(`[submitAnswer] Question ${question_id} already answered in session ${session_id}. Skipping history insert.`)
      } else {
        throw answerErr
      }
    }

    // ── 9.5 Record Vocabulary Tracking (US-33) ────────────────────────────────
    try {
      const { data: existingStats, error: fetchErr } = await supabase
        .from('user_vocab_stats')
        .select('correct_count, incorrect_count')
        .eq('user_id', playerId)
        .eq('word_id', question_id)
        .maybeSingle()
        
      if (fetchErr) {
        console.error('Error fetching user_vocab_stats:', fetchErr)
      } else {
        const correctCount = (existingStats?.correct_count || 0) + (isCorrect ? 1 : 0)
        const incorrectCount = (existingStats?.incorrect_count || 0) + (!isCorrect ? 1 : 0)
        
        const { error: upsertErr } = await supabase.from('user_vocab_stats').upsert({
          user_id: playerId,
          word_id: question_id,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,word_id' })
        
        if (upsertErr) {
          console.error('Error upserting user_vocab_stats:', upsertErr)
        }
      }
    } catch (vocabErr) {
      console.error('Error tracking vocabulary:', vocabErr)
    }

    // ── 10. Update session totals atomically ──────────────────────────────────
    const { data: atomicData, error: updateErr } = await supabase
      .rpc('submit_answer_atomic', {
        p_session_id: session_id,
        p_points_delta: pointsDelta
      })

    if (updateErr) throw updateErr
    
    const result = Array.isArray(atomicData) ? atomicData[0] : atomicData
    if (!result) {
      res.status(409).json({ error: 'Failed to update session totals (session may have ended).' })
      return
    }

    const newScore = result.new_score
    const newQuestionsAnswered = result.new_questions_answered

    // ── 11. Build response ────────────────────────────────────────────────────
    const pointsEarned = isCorrect ? pointsDelta : 0
    const pointsDeducted = isCorrect ? 0 : Math.abs(pointsDelta)

    res.status(200).json({
      status: 'success',
      correct: isCorrect,
      points_earned: pointsEarned,
      points_deducted: pointsDeducted,
      new_total_score: newScore,
      penalty_type: penaltyType,
      accuracy: Math.round(accuracy * 1000) / 1000,
      questions_answered: newQuestionsAnswered,
      correct_word: !isCorrect ? question.target_word : undefined,
      timer_delta: timerDelta,
      forgive_mistake: forgiveMistake,
      lock_input_ms: lockInputMs,
      pause_timer_ms: pauseTimerMs,
      shield_delta: scoringResult.shieldDelta,
      breakdown: {
        base_score: breakdown.base,
        combo_bonus: breakdown.combo_bonus,
        flat_buff: breakdown.flat_buff,
        multiplier_buff: breakdown.multiplier_buff,
        mission_completed: breakdown.mission_completed,
        oracle_penalty: breakdown.oracle_penalty,
        penalty: breakdown.penalty,
        core_name: core.name,
        shield_blocked: breakdown.shield_blocked,
        final_shield_count: breakdown.finalShieldCount
      }
    })
  } catch (err) {
    console.error('submitAnswer error:', err)
    res.status(500).json({ error: 'Failed to submit answer.' })
  }
}

// ── Endpoint: POST /api/game/timeout ──────────────────────────────────────────
export async function timeoutSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const playerId = req.user!.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { session_id, active_core_id, oracle_reveal_level } = req.body
    if (!session_id) { res.status(400).json({ error: 'session_id required' }); return }

    const { data: session, error: fetchErr } = await supabase
      .from('game_sessions')
      .select('id, status, score, questions_answered')
      .eq('id', session_id)
      .eq('player_id', playerId)
      .single()

    if (fetchErr || !session) { res.status(404).json({ error: 'Session not found' }); return }
    if (session.status !== 'active') { res.status(409).json({ error: 'Session already ended' }); return }

    // Deduct Oracle Penalty on timeout if used
    let oraclePenalty = 0
    const revealLevel = Number(oracle_reveal_level) || 0
    if (revealLevel > 0 && active_core_id) {
      const { data: core } = await supabase.from('cores').select('name').eq('id', active_core_id).single()
      if (core?.name?.toLowerCase().includes('oracle')) {
        const cumulativeCosts = [10, 30, 60]
        const levelIndex = Math.min(Math.max(revealLevel, 1), cumulativeCosts.length) - 1
        oraclePenalty = cumulativeCosts[levelIndex]
      }
    }

    const finalScore = Math.max(0, (session.score ?? 0) - oraclePenalty)

    // Fetch player profile to get current Elo and stats
    const { data: playerProfile } = await supabase
      .from('players')
      .select('elo, wins, losses, total_matches')
      .eq('id', playerId)
      .single()

    let newElo = 0
    let eloDelta = 0

    if (playerProfile) {
      const currentElo = playerProfile.elo ?? 0
      const wins = playerProfile.wins ?? 0
      const losses = playerProfile.losses ?? 0
      const totalMatches = playerProfile.total_matches ?? 0

      // Expected score based on current Elo
      const expectedScore = Math.max(500, 500 + Math.floor(currentElo * 0.5))
      
      // Calculate Elo change: K-factor = 0.05 of the score difference
      eloDelta = Math.floor(0.05 * (finalScore - expectedScore))
      
      // Clamp the delta to avoid extreme shifts
      eloDelta = Math.max(-100, Math.min(150, eloDelta))
      
      newElo = Math.max(0, currentElo + eloDelta)
      const isWin = finalScore >= expectedScore

      await supabase
        .from('players')
        .update({
          elo: newElo,
          wins: wins + (isWin ? 1 : 0),
          losses: losses + (isWin ? 0 : 1),
          total_matches: totalMatches + 1
        })
        .eq('id', playerId)
    }

    const { error: updateErr } = await supabase
      .from('game_sessions')
      .update({
        status: 'timeout',
        score: finalScore,
        questions_answered: session.questions_answered ?? 0,
        ended_at: new Date().toISOString()
      })
      .eq('id', session_id)
      .eq('player_id', playerId)
      .eq('status', 'active')

    if (updateErr) throw updateErr

    res.status(200).json({
      message: 'Session ended',
      score: finalScore,
      questions_answered: session.questions_answered ?? 0,
      elo_change: eloDelta,
      new_elo: newElo
    })
  } catch (err) {
    console.error('timeoutSession error:', err)
    res.status(500).json({ error: 'Failed to end session.' })
  }
}

// ── Endpoint: POST /api/game/abandon ──────────────────────────────────────────
export async function abandonSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const playerId = req.user!.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { session_id } = req.body
    if (!session_id) { res.status(400).json({ error: 'session_id required' }); return }

    const { data: session, error: fetchErr } = await supabase
      .from('game_sessions')
      .select('id, status')
      .eq('id', session_id)
      .eq('player_id', playerId)
      .single()

    if (fetchErr || !session) { res.status(404).json({ error: 'Session not found' }); return }
    if (session.status !== 'active') { res.status(409).json({ error: 'Session already ended' }); return }

    const { error: updateErr } = await supabase
      .from('game_sessions')
      .update({ status: 'abandoned', ended_at: new Date().toISOString() })
      .eq('id', session_id)
      .eq('player_id', playerId)
      .eq('status', 'active')

    if (updateErr) throw updateErr

    res.status(200).json({ message: 'Session abandoned' })
  } catch (err) {
    console.error('abandonSession error:', err)
    res.status(500).json({ error: 'Failed to abandon session.' })
  }
}

// ── Endpoint: PUT /api/game/session/core ──────────────────────────────────────
export async function updateSessionCore(req: AuthRequest, res: Response): Promise<void> {
  try {
    const playerId = req.user!.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { session_id, new_core_id } = req.body
    if (!session_id || !new_core_id) {
      res.status(400).json({ error: 'session_id and new_core_id are required.' })
      return
    }

    // 1. Fetch current session and its active_core_id
    const { data: session, error: sessErr } = await supabase
      .from('game_sessions')
      .select('active_core_id')
      .eq('id', session_id)
      .eq('player_id', playerId)
      .single()

    if (sessErr || !session) {
      res.status(404).json({ error: 'Session not found.' })
      return
    }

    // 2. Fetch current core details
    const { data: currentCore, error: currErr } = await supabase
      .from('cores')
      .select('name, tier')
      .eq('id', session.active_core_id)
      .single()

    // 3. Fetch new core details
    const { data: newCore, error: newErr } = await supabase
      .from('cores')
      .select('name, tier')
      .eq('id', new_core_id)
      .single()

    if (currErr || newErr || !currentCore || !newCore) {
      res.status(400).json({ error: 'Invalid core transition: core details not found.' })
      return
    }

    // 4. Validate transition tier and family consistency (Anti-cheat)
    const currentFamily = getCoreFamily(currentCore.name)
    const newFamily = getCoreFamily(newCore.name)

    if (newCore.tier !== currentCore.tier + 1 || currentFamily !== newFamily) {
      res.status(403).json({ error: 'Core transition verification failed (Anti-cheat triggered).' })
      return
    }

    const { error } = await supabase
      .from('game_sessions')
      .update({ active_core_id: new_core_id })
      .eq('id', session_id)
      .eq('player_id', playerId)

    if (error) throw error
    res.status(200).json({ status: 'success' })
  } catch (err) {
    console.error('updateSessionCore error:', err)
    res.status(500).json({ error: 'Failed to update session core.' })
  }
}