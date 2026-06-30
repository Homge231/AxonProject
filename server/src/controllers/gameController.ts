import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

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

export async function createSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { data: player } = await supabase.from('players').select('username, avatar_url').eq('id', playerId).single()
    const finalAvatarUrl = player?.avatar_url?.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player?.username || 'Player'}`

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({ player_id: playerId, status: 'active' })
      .select('id')
      .single()

    if (error) throw error

    const themes = ['daily-life', 'cafe', 'travel']
    const randomTheme = themes[Math.floor(Math.random() * themes.length)]

    res.status(201).json({ session_id: data.id, theme: randomTheme, avatar_url: finalAvatarUrl })
  } catch (err) {
    console.error('createSession error:', err)
    res.status(500).json({ error: 'Failed to create session.' })
  }
}

export async function submitAnswer(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { session_id, question_id, answer } = req.body
    const { data: session, error: sessErr } = await supabase
      .from('game_sessions')
      .select('id, status, score, questions_answered')
      .eq('id', session_id)
      .eq('player_id', playerId)
      .single()

    if (sessErr || !session || session.status !== 'active') { res.status(400).json({ error: 'Invalid session' }); return }

    const { data: question, error: qErr } = await supabase.from('questions').select('target_word').eq('id', question_id).single()
    if (qErr || !question) { res.status(404).json({ error: 'Question not found' }); return }

    const isCorrect = answer.toLowerCase() === question.target_word.toLowerCase()
    if (isCorrect) {
      const points = 100
      const newScore = (session.score || 0) + points
      const newQuestionsAnswered = (session.questions_answered || 0) + 1
      await supabase.from('game_sessions').update({ score: newScore, questions_answered: newQuestionsAnswered }).eq('id', session_id)
      res.status(200).json({ correct: true, points_earned: points, current_total_score: newScore, questions_answered: newQuestionsAnswered })
    } else {
      res.status(200).json({ correct: false, points_earned: 0, current_total_score: session.score, questions_answered: session.questions_answered })
    }
  } catch (err) {
    console.error('submitAnswer error:', err)
    res.status(500).json({ error: 'Failed to submit.' })
  }
}

export async function timeoutSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { session_id, score, questions_answered } = req.body
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
      .update({
        status: 'timeout',
        score: score ?? 0,
        questions_answered: questions_answered ?? 0,
        ended_at: new Date().toISOString()
      })
      .eq('id', session_id)

    if (updateErr) throw updateErr

    res.status(200).json({ message: 'Session ended' })
  } catch (err) {
    console.error('timeoutSession error:', err)
    res.status(500).json({ error: 'Failed to end session.' })
  }
}