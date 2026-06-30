import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE_POINTS = 100
const COMBO_BONUS_PER_STREAK = 10   // +10 pts per combo level (combo 5 → +50)
const MAX_COMBO_BONUS = 100         // cap combo bonus at +100 pts
const DEFAULT_CORE_ID = '00000000-0000-0000-0000-000000000001' // "No Core"

// ── Types ─────────────────────────────────────────────────────────────────────
interface CoreRow {
  id: string
  name: string
  flat_buff: number
  multiplier_buff: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeAnswer(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function getWrongAnswerPenalty(answer: string, target: string): number {
  let wrongCount = Math.abs(target.length - answer.length)
  const comparableLength = Math.min(answer.length, target.length)
  for (let i = 0; i < comparableLength; i++) {
    if (answer[i] !== target[i]) wrongCount++
  }
  return Math.min(25, Math.max(5, wrongCount * 5))
}

/**
 * Core scoring formula:
 *   correct  → floor( ((BASE + comboBonus) + flat_buff) * multiplier_buff )
 *   wrong    → -(penalty)  [no core buffs applied to wrong answers]
 */
function calculateScore(
  isCorrect: boolean,
  combo: number,
  core: CoreRow,
  wrongPenalty: number
): { pointsDelta: number; breakdown: Record<string, number> } {
  if (!isCorrect) {
    return {
      pointsDelta: -wrongPenalty,
      breakdown: { base: 0, combo_bonus: 0, flat_buff: 0, multiplier_buff: 1, penalty: wrongPenalty }
    }
  }

  const comboBonus = Math.min(combo * COMBO_BONUS_PER_STREAK, MAX_COMBO_BONUS)
  const beforeMultiplier = BASE_POINTS + comboBonus + core.flat_buff
  const total = Math.floor(beforeMultiplier * core.multiplier_buff)

  return {
    pointsDelta: total,
    breakdown: {
      base: BASE_POINTS,
      combo_bonus: comboBonus,
      flat_buff: core.flat_buff,
      multiplier_buff: core.multiplier_buff,
      penalty: 0
    }
  }
}

// ── Endpoint: GET /api/game/question (legacy) ─────────────────────────────────
export async function getQuestion(_req: Request, res: Response): Promise<void> {
  try {
    const { data: ids, error: idError } = await supabase.from('questions').select('id')
    if (idError) throw idError
    if (!ids || ids.length === 0) { res.status(404).json({ error: 'No questions available.' }); return }

    const randomId = ids[Math.floor(Math.random() * ids.length)].id
    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('id, question_text, target_word, hint')
      .eq('id', randomId)
      .single()

    if (qError) throw qError
    res.status(200).json(question)
  } catch (err) {
    console.error('getQuestion error:', err)
    res.status(500).json({ error: 'Failed to fetch question.' })
  }
}

// ── Endpoint: GET /api/game/questions ────────────────────────────────────────
export async function getQuestions(_req: Request, res: Response): Promise<void> {
  const BATCH_SIZE = 20
  try {
    const { data: ids, error: idError } = await supabase.from('questions').select('id')
    if (idError) throw idError
    if (!ids || ids.length === 0) { res.status(404).json({ error: 'No questions available.' }); return }

    const shuffled = [...ids].sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE)
    const pickedIds = shuffled.map((r: { id: string }) => r.id)

    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, question_text, target_word, hint')
      .in('id', pickedIds)

    if (qError) throw qError
    const shuffledQuestions = (questions ?? []).sort(() => Math.random() - 0.5)
    res.status(200).json({ questions: shuffledQuestions })
  } catch (err) {
    console.error('getQuestions error:', err)
    res.status(500).json({ error: 'Failed to fetch questions.' })
  }
}

// ── Endpoint: GET /api/game/cores ────────────────────────────────────────────
export async function getCores(_req: Request, res: Response): Promise<void> {
  try {
    const { data: cores, error } = await supabase
      .from('cores')
      .select('id, name, description, flat_buff, multiplier_buff')
      .order('name')

    if (error) throw error
    res.status(200).json({ cores: cores ?? [] })
  } catch (err) {
    console.error('getCores error:', err)
    res.status(500).json({ error: 'Failed to fetch cores.' })
  }
}

// ── Endpoint: POST /api/game/session ─────────────────────────────────────────
export async function createSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { active_core_id } = req.body

    // Validate core exists if provided
    const coreId = active_core_id ?? DEFAULT_CORE_ID
    const { data: core, error: coreErr } = await supabase
      .from('cores')
      .select('id, name')
      .eq('id', coreId)
      .single()

    if (coreErr || !core) {
      res.status(400).json({ error: 'Invalid active_core_id: core not found.' })
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
      .insert({ player_id: playerId, status: 'active', active_core_id: coreId })
      .select('id')
      .single()

    if (error) throw error

    const themes = ['daily-life', 'cafe', 'travel']
    const randomTheme = themes[Math.floor(Math.random() * themes.length)]

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
 * Calculates: ((Base + ComboBonus) + FlatBuff) * MultiplierBuff
 * Returns:   { status, correct, points_earned, points_deducted, current_total_score, questions_answered, breakdown }
 */
export async function submitAnswer(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { session_id, question_id, answer, time_taken, current_combo, active_core_id } = req.body

    // ── 1. Input validation ───────────────────────────────────────────────────
    if (!session_id || !question_id || typeof answer !== 'string') {
      res.status(400).json({ error: 'session_id, question_id and answer are required.' })
      return
    }

    const combo = typeof current_combo === 'number' && current_combo >= 0
      ? Math.floor(current_combo)
      : 0

    // ── 2. Fetch session (verify ownership & status) ──────────────────────────
    const { data: session, error: sessErr } = await supabase
      .from('game_sessions')
      .select('id, status, score, questions_answered, active_core_id')
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
    const sessionCoreId = session.active_core_id ?? DEFAULT_CORE_ID
    const submittedCoreId = active_core_id ?? DEFAULT_CORE_ID

    if (submittedCoreId !== sessionCoreId) {
      console.warn(
        `[ANTI-CHEAT] Player ${playerId} submitted core ${submittedCoreId} but session core is ${sessionCoreId}`
      )
      res.status(403).json({
        error: 'Core mismatch: submitted active_core_id does not match the session\'s selected core.'
      })
      return
    }

    // ── 4. Fetch core buffs ───────────────────────────────────────────────────
    const { data: coreRow, error: coreErr } = await supabase
      .from('cores')
      .select('id, name, flat_buff, multiplier_buff')
      .eq('id', sessionCoreId)
      .single()

    if (coreErr || !coreRow) {
      res.status(500).json({ error: 'Failed to load core data.' })
      return
    }

    const core: CoreRow = coreRow

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

    const wrongPenalty = isCorrect ? 0 : getWrongAnswerPenalty(normalizedAnswer, normalizedTarget)

    // ── 6. Calculate score ────────────────────────────────────────────────────
    const { pointsDelta, breakdown } = calculateScore(isCorrect, combo, core, wrongPenalty)

    // ── 7. Record the answer (unique per session+question) ────────────────────
    const { error: answerErr } = await supabase
      .from('game_session_answers')
      .insert({
        session_id,
        question_id,
        answer,
        correct: isCorrect,
        points_delta: pointsDelta
      })

    if (answerErr) {
      if (answerErr.code === '23505') {
        res.status(409).json({ error: 'Question already answered for this session.' })
        return
      }
      throw answerErr
    }

    // ── 8. Update session totals ──────────────────────────────────────────────
    const newScore = Math.max(0, (session.score || 0) + pointsDelta)
    const newQuestionsAnswered = (session.questions_answered || 0) + 1

    const { error: updateErr } = await supabase
      .from('game_sessions')
      .update({ score: newScore, questions_answered: newQuestionsAnswered })
      .eq('id', session_id)
      .eq('player_id', playerId)
      .eq('status', 'active')

    if (updateErr) throw updateErr

    // ── 9. Build response ─────────────────────────────────────────────────────
    const pointsEarned = isCorrect ? pointsDelta : 0
    const pointsDeducted = isCorrect ? 0 : Math.abs(pointsDelta)

    res.status(200).json({
      status: 'success',
      correct: isCorrect,
      points_earned: pointsEarned,
      points_deducted: pointsDeducted,
      current_total_score: newScore,
      questions_answered: newQuestionsAnswered,
      breakdown: {
        base_score: breakdown.base,
        combo_bonus: breakdown.combo_bonus,
        flat_buff: breakdown.flat_buff,
        multiplier_buff: breakdown.multiplier_buff,
        penalty: breakdown.penalty,
        core_name: core.name
      }
    })
  } catch (err) {
    console.error('submitAnswer error:', err)
    res.status(500).json({ error: 'Failed to submit answer.' })
  }
}

// ── Endpoint: POST /api/game/timeout ─────────────────────────────────────────
export async function timeoutSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { session_id } = req.body
    if (!session_id) { res.status(400).json({ error: 'session_id required' }); return }

    const { data: session, error: fetchErr } = await supabase
      .from('game_sessions')
      .select('id, status, score, questions_answered')
      .eq('id', session_id)
      .eq('player_id', playerId)
      .single()

    if (fetchErr || !session) { res.status(404).json({ error: 'Session not found' }); return }
    if (session.status !== 'active') { res.status(409).json({ error: 'Session already ended' }); return }

    const { error: updateErr } = await supabase
      .from('game_sessions')
      .update({
        status: 'timeout',
        score: session.score ?? 0,
        questions_answered: session.questions_answered ?? 0,
        ended_at: new Date().toISOString()
      })
      .eq('id', session_id)
      .eq('player_id', playerId)
      .eq('status', 'active')

    if (updateErr) throw updateErr

    res.status(200).json({
      message: 'Session ended',
      score: session.score ?? 0,
      questions_answered: session.questions_answered ?? 0
    })
  } catch (err) {
    console.error('timeoutSession error:', err)
    res.status(500).json({ error: 'Failed to end session.' })
  }
}

// ── Endpoint: POST /api/game/abandon ─────────────────────────────────────────
export async function abandonSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
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