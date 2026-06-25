import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * GET /api/game/question
 * Giữ nguyên để không breaking change.
 * Trả về 1 câu hỏi ngẫu nhiên.
 */
export async function getQuestion(_req: Request, res: Response): Promise<void> {
  try {
    const { data: ids, error: idError } = await supabase
      .from('questions')
      .select('id')

    if (idError) throw idError
    if (!ids || ids.length === 0) {
      res.status(404).json({ error: 'No questions available.' })
      return
    }

    const randomId = ids[Math.floor(Math.random() * ids.length)].id

    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('question_text, target_word, hint')
      .eq('id', randomId)
      .single()

    if (qError) throw qError

    res.status(200).json(question)
  } catch (err) {
    console.error('getQuestion error:', err)
    res.status(500).json({ error: 'Failed to fetch question.' })
  }
}

/**
 * GET /api/game/questions
 * Trả về batch 20 câu hỏi ngẫu nhiên, không trùng nhau trong batch.
 * Response: { questions: { question_text, target_word, hint }[] }
 */
export async function getQuestions(_req: Request, res: Response): Promise<void> {
  const BATCH_SIZE = 20
  try {
    const { data: ids, error: idError } = await supabase
      .from('questions')
      .select('id')

    if (idError) throw idError
    if (!ids || ids.length === 0) {
      res.status(404).json({ error: 'No questions available.' })
      return
    }

    // Shuffle toàn bộ IDs rồi lấy tối đa BATCH_SIZE cái
    const shuffled = [...ids].sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE)
    const pickedIds = shuffled.map((r: { id: string }) => r.id)

    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('question_text, target_word, hint')
      .in('id', pickedIds)

    if (qError) throw qError

    // Shuffle lại lần nữa để thứ tự không bị đoán theo insertion order
    const shuffledQuestions = (questions ?? []).sort(() => Math.random() - 0.5)

    res.status(200).json({ questions: shuffledQuestions })
  } catch (err) {
    console.error('getQuestions error:', err)
    res.status(500).json({ error: 'Failed to fetch questions.' })
  }
}

/**
 * POST /api/game/session
 * Tạo một session mới khi trận bắt đầu. Trả về session_id.
 */
export async function createSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({ player_id: playerId, status: 'active' })
      .select('id')
      .single()

    if (error) throw error
    res.status(201).json({ session_id: data.id })
  } catch (err) {
    console.error('createSession error:', err)
    res.status(500).json({ error: 'Failed to create session.' })
  }
}

/**
 * POST /api/game/timeout
 * Khoá session khi hết giờ. Reject duplicate call bằng 409.
 * Body: { session_id, score, questions_answered }
 */
export async function timeoutSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { session_id, score, questions_answered } = req.body

    if (!session_id) {
      res.status(400).json({ error: 'session_id is required.' })
      return
    }

    const { data: session, error: fetchError } = await supabase
      .from('game_sessions')
      .select('id, status, player_id')
      .eq('id', session_id)
      .single()

    if (fetchError || !session) {
      res.status(404).json({ error: 'Session not found.' })
      return
    }
    if (session.player_id !== playerId) {
      res.status(403).json({ error: 'Forbidden.' })
      return
    }
    if (session.status !== 'active') {
      res.status(409).json({ error: 'Session already ended.', status: session.status })
      return
    }

    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({
        status:             'timeout',
        score:              score             ?? 0,
        questions_answered: questions_answered ?? 0,
        ended_at:           new Date().toISOString(),
      })
      .eq('id', session_id)

    if (updateError) throw updateError

    res.status(200).json({ message: 'Session locked as timeout.', session_id })
  } catch (err) {
    console.error('timeoutSession error:', err)
    res.status(500).json({ error: 'Failed to lock session.' })
  }
}