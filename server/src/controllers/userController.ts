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
  if (elo >= 6500) return 'Grandmaster'
  if (elo >= 5500) return 'Master'
  if (elo >= 4500) return 'Diamond'
  if (elo >= 3500) return 'Platinum'
  if (elo >= 2500) return 'Gold'
  if (elo >= 1500) return 'Silver'
  return 'Bronze'
}

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data: profile, error } = await supabase
      .from('players')
      .select('username, avatar_url, elo, wins, losses, total_matches')
      .eq('id', req.user!.id)
      .maybeSingle()

    if (error) {
      console.error('getUserProfile query error:', error)
      return res.status(400).json({ error: error.message })
    }

    const { data: { user } } = await supabase.auth.admin.getUserById(req.user!.id)
    const userMeta = user?.user_metadata || {}
    const gmailAvatar = userMeta.avatar_url || userMeta.picture || ''

    const finalAvatar = profile?.avatar_url?.trim()
      ? profile.avatar_url
      : gmailAvatar

    const elo = profile?.elo ?? 0

    return res.status(200).json({
      username: profile?.username || userMeta.full_name || 'Player',
      avatar_url: finalAvatar,
      elo,
      rank: getRankFromElo(elo),
      wins: profile?.wins ?? 0,
      losses: profile?.losses ?? 0,
      total_matches: profile?.total_matches ?? 0
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
    if (avatar_url?.trim()) updates.avatar_url = avatar_url.trim()

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

    return res.status(200).json({
      message: 'Profile updated',
      profile: {
        username: data.username,
        avatar_url: data.avatar_url,
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