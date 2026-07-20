import { Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { AuthRequest } from '../middleware/authMiddleware'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

function getRankFromElo(elo: number): string {
  if (elo >= 8000) return 'Grandmaster'
  if (elo >= 7500) return 'Master'
  if (elo >= 7000) return 'Diamond III'
  if (elo >= 6500) return 'Diamond II'
  if (elo >= 6000) return 'Diamond I'
  if (elo >= 5500) return 'Platinum III'
  if (elo >= 5000) return 'Platinum II'
  if (elo >= 4500) return 'Platinum I'
  if (elo >= 4000) return 'Gold III'
  if (elo >= 3500) return 'Gold II'
  if (elo >= 3000) return 'Gold I'
  if (elo >= 2500) return 'Silver III'
  if (elo >= 2000) return 'Silver II'
  if (elo >= 1500) return 'Silver I'
  if (elo >= 1000) return 'Bronze III'
  if (elo >= 500) return 'Bronze II'
  return 'Bronze I'
}

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data: profile, error } = await supabase
      .from('players')
      .select('username, avatar_url, elo, wins, losses, total_matches, is_first_play')
      .eq('id', req.user!.id)
      .maybeSingle()

    if (error) {
      console.error('getUserProfile query error:', error)
      return res.status(400).json({ error: error.message })
    }

    const { data: { user } } = await supabase.auth.admin.getUserById(req.user!.id)
    const userMeta = user?.user_metadata || {}
    const gmailAvatar = userMeta.avatar_url || userMeta.picture || ''

    const username = profile?.username || userMeta.full_name || 'Player'
    const finalAvatar = profile?.avatar_url?.trim()
      ? profile.avatar_url
      : gmailAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`

    const elo = profile?.elo ?? 0

    return res.status(200).json({
      id: req.user!.id,
      username,
      avatar_url: finalAvatar,
      elo,
      rank: getRankFromElo(elo),
      wins: profile?.wins ?? 0,
      losses: profile?.losses ?? 0,
      total_matches: profile?.total_matches ?? 0,
      is_first_play: profile?.is_first_play ?? true
    })
  } catch (error) {
    console.error('getUserProfile error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { username, avatar_url } = req.body

    if (!username && !avatar_url) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    const updates: any = {}
    if (username?.trim()) updates.username = username.trim()

    if (avatar_url?.trim()) {
      let finalAvatarToSave = avatar_url.trim()

      // If it's a new base64 upload, store it in the avatars bucket
      if (finalAvatarToSave.startsWith('data:image')) {
        try {
          const match = finalAvatarToSave.match(/^data:image\/(\w+);base64,/)
          const ext = match ? match[1] : 'png'
          const base64Data = finalAvatarToSave.replace(/^data:image\/\w+;base64,/, '')
          const buffer = Buffer.from(base64Data, 'base64')

          const filePath = `${req.user!.id}/avatar.${ext}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, buffer, {
              contentType: `image/${ext}`,
              upsert: true
            })

          if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            return res.status(500).json({ error: 'Failed to upload avatar to storage' })
          }

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

          // Append timestamp to bypass browser cache on updates
          finalAvatarToSave = `${publicUrl}?t=${Date.now()}`
        } catch (uploadErr) {
          console.error('Avatar processing error:', uploadErr)
          return res.status(500).json({ error: 'Failed to process avatar image' })
        }
      }

      updates.avatar_url = finalAvatarToSave
    }

    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', req.user!.id)
      .select('username, avatar_url, elo, wins, losses, total_matches')
      .single()

    if (error) {
      console.error('updateUserProfile query error:', error)
      return res.status(400).json({ error: error.message })
    }

    const elo = data?.elo ?? 0
    const finalUsername = data.username || 'Player'
    const finalAvatar = data.avatar_url?.trim()
      ? data.avatar_url
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(finalUsername)}`

    return res.status(200).json({
      message: 'Profile updated',
      profile: {
        username: finalUsername,
        avatar_url: finalAvatar,
        elo,
        rank: getRankFromElo(elo),
        wins: data.wins ?? 0,
        losses: data.losses ?? 0,
        total_matches: data.total_matches ?? 0
      }
    })
  } catch (error) {
    console.error('updateUserProfile error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const getVocabAnalytics = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('user_vocab_stats')
      .select('correct_count, incorrect_count, questions(topic, target_word)')
      .eq('user_id', req.user!.id)

    if (error) {
      console.error('getVocabAnalytics error:', error)
      return res.status(400).json({ error: error.message })
    }

    const topics: Record<string, { 
      correct: number; 
      total: number; 
      words: { word: string; incorrect: number; correct: number }[] 
    }> = {}
    
    for (const row of data || []) {
      const q = row.questions as any
      const topic = q?.topic || 'unknown'
      const targetWord = q?.target_word || 'unknown'
      
      if (!topics[topic]) {
        topics[topic] = { correct: 0, total: 0, words: [] }
      }
      topics[topic].correct += row.correct_count
      topics[topic].total += row.correct_count + row.incorrect_count
      topics[topic].words.push({
        word: targetWord,
        incorrect: row.incorrect_count,
        correct: row.correct_count
      })
    }

    const result = Object.keys(topics).map(topic => {
      const correct = topics[topic].correct
      const total = topics[topic].total
      const accuracy = total > 0 ? (correct / total) * 100 : 0
      
      const words = topics[topic].words
      const uniqueWordsCount = words.length
      
      // Get weakest words (most incorrect answers, must have at least 1 incorrect)
      const weakestWords = words
        .filter(w => w.incorrect > 0)
        .sort((a, b) => b.incorrect - a.incorrect)
        .slice(0, 3)
        .map(w => ({ word: w.word, incorrect: w.incorrect }))

      return {
        topic,
        accuracy: Math.round(accuracy * 10) / 10,
        totalQuestions: total,
        correctAnswers: correct,
        uniqueWordsCount,
        weakestWords
      }
    }).sort((a, b) => b.totalQuestions - a.totalQuestions)

    return res.status(200).json(result)
  } catch (error) {
    console.error('getVocabAnalytics exception:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}