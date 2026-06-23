import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'

// Use service key to bypass RLS — same pattern as other controllers
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * GET /api/game/question
 * Auth: JWT required (applied in gameRoutes.ts)
 *
 * Picks a random question from the `questions` table.
 * Response: { question_text: string, target_word: string }
 */
export async function getQuestion(_req: Request, res: Response): Promise<void> {
  try {
    // Fetch all IDs, pick one randomly, then fetch that row.
    // Avoids loading all text into memory for large question banks.
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
      .select('question_text, target_word')
      .eq('id', randomId)
      .single()

    if (qError) throw qError

    res.status(200).json(question)
  } catch (err) {
    console.error('getQuestion error:', err)
    res.status(500).json({ error: 'Failed to fetch question.' })
  }
}
 
// ── POST /api/game/session ─────────────────────────────────────────────────
// Called by the client when a match starts to create an active session row.
// Returns { session_id } which the client stores and sends on timeout/quit.
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
 
// ── POST /api/game/timeout ─────────────────────────────────────────────────
// US-04 [BE] — locks the session on timeout.
// Body: { session_id: string, score: number, questions_answered: number }
export async function timeoutSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }
 
    const { session_id, score, questions_answered } = req.body
 
    if (!session_id) {
      res.status(400).json({ error: 'session_id is required.' })
      return
    }
 
    // Fetch the session — must belong to this player and still be active
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
      // Already locked — reject silently so duplicate calls don't error
      res.status(409).json({ error: 'Session already ended.', status: session.status })
      return
    }
 
    // Lock the session
    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({
        status:              'timeout',
        score:               score            ?? 0,
        questions_answered:  questions_answered ?? 0,
        ended_at:            new Date().toISOString(),
      })
      .eq('id', session_id)
 
    if (updateError) throw updateError
 
    res.status(200).json({ message: 'Session locked as timeout.', session_id })
  } catch (err) {
    console.error('timeoutSession error:', err)
    res.status(500).json({ error: 'Failed to lock session.' })
  }
}