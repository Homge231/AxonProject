import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { generateToken } from '../utils/jwt'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { generateOTP, saveOTP, verifyOTP } from '../utils/otp'
import { sendOTPEmail } from '../utils/mailer'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

const router = Router()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

interface PendingRegistration {
  email: string
  password: string
  hashedPassword: string
  username: string
  expiresAt: number
}

const pendingRegistrations = new Map<string, PendingRegistration>()

setInterval(() => {
  const now = Date.now()
  for (const [key, val] of pendingRegistrations.entries()) {
    if (now > val.expiresAt) pendingRegistrations.delete(key)
  }
}, 5 * 60 * 1000)

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, username } = req.body

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' })
    return
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }
  if (!username || username.trim().length === 0) {
    res.status(400).json({ error: 'Username is required' })
    return
  }

  try {
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingPlayer) {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(existingPlayer.id)
      const isOAuthOnly = !authUser?.identities?.some((id: any) => id.provider === 'email')
      if (isOAuthOnly) {
        res.status(409).json({ error: 'This email is linked to a Google account. Please sign in with Google.' })
      } else {
        res.status(409).json({ error: 'Email already registered' })
      }
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    pendingRegistrations.set(email, {
      email,
      password,
      hashedPassword,
      username,
      expiresAt: Date.now() + 10 * 60 * 1000
    })

    const otp = generateOTP()
    saveOTP(email, otp)
    await sendOTPEmail(email, otp)

    res.status(200).json({ message: 'OTP sent to your email', email })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    res.status(400).json({ error: 'Email and OTP are required' })
    return
  }

  const isValid = verifyOTP(email, otp)
  if (!isValid) {
    res.status(400).json({ error: 'Invalid or expired OTP' })
    return
  }

  const pending = pendingRegistrations.get(email)
  if (!pending || Date.now() > pending.expiresAt) {
    pendingRegistrations.delete(email)
    res.status(400).json({ error: 'Registration session expired. Please register again.' })
    return
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: pending.email,
      password: pending.password,
      email_confirm: true,
      user_metadata: { full_name: pending.username }
    })

    if (authError) {
      res.status(400).json({ error: authError.message })
      return
    }

    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    if (existingPlayer) {
      const { error: updateError } = await supabase
        .from('players')
        .update({
          email: pending.email,
          username: pending.username,
          hashed_password: pending.hashedPassword
        })
        .eq('id', authData.user.id)

      if (updateError) {
        res.status(400).json({ error: updateError.message })
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('players')
        .insert({
          id: authData.user.id,
          email: pending.email,
          username: pending.username,
          hashed_password: pending.hashedPassword,
          elo: 1000,
          wins: 0,
          losses: 0,
          total_matches: 0
        })

      if (insertError) {
        res.status(400).json({ error: insertError.message })
        return
      }
    }

    pendingRegistrations.delete(email)

    const token = generateToken({
      id: authData.user.id,
      email: authData.user.email || '',
      username: pending.username
    })

    res.status(201).json({
      message: 'Account verified successfully',
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: pending.username,
        elo: 1000
      }
    })

  } catch (error) {
    console.error('verify-otp error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /auth/resend-otp
router.post('/resend-otp', async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    res.status(400).json({ error: 'Email is required' })
    return
  }

  const pending = pendingRegistrations.get(email)
  if (!pending) {
    res.status(400).json({ error: 'No pending registration found' })
    return
  }

  try {
    const otp = generateOTP()
    saveOTP(email, otp)
    await sendOTPEmail(email, otp)
    res.json({ message: 'OTP resent successfully' })
  } catch {
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' })
    return
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }

  try {
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingPlayer) {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(existingPlayer.id)
      const isOAuthOnly = !authUser?.identities?.some((id: any) => id.provider === 'email')
      if (isOAuthOnly) {
        res.status(401).json({ error: 'This account uses Google sign-in. Please use the Google button to log in.' })
        return
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const { data: profile } = await supabase
      .from('players')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    const token = generateToken({
      id: authData.user.id,
      email: authData.user.email || '',
      username: profile?.username || ''
    })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: profile?.username,
        avatar_url: profile?.avatar_url,
        elo: profile?.elo ?? 1000
      }
    })

  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /auth/token
router.post('/token', async (req: Request, res: Response) => {
  const { supabase_token } = req.body
  if (!supabase_token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser(supabase_token)
    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    const { data: profile } = await supabase
      .from('players')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      const { error: insertError } = await supabase.from('players').insert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
        hashed_password: '',
        avatar_url: user.user_metadata?.avatar_url || null,
        elo: 1000,
        wins: 0,
        losses: 0,
        total_matches: 0
      })
      if (insertError) {
        console.error('players insert error in /auth/token:', insertError)
      }
    }

    const { data: freshProfile } = await supabase
      .from('players')
      .select('*')
      .eq('id', user.id)
      .single()

    const token = generateToken({
      id: user.id,
      email: user.email || '',
      username: freshProfile?.username || user.user_metadata?.full_name || ''
    })

    res.json({ token, user: freshProfile })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user })
})

// GET /auth/profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data: profile } = await supabase
    .from('players')
    .select('*')
    .eq('id', req.user!.id)
    .single()

  if (!profile) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }

  res.json({ profile })
})

export default router