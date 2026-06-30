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

// ── Helper: check provider type from players table (fast, no admin API) ──────
// hashed_password === '' means Google-only (set during OAuth upsert)
// hashed_password is a bcrypt hash means email account exists
async function getPlayerProviderInfo(email: string): Promise<{
  exists: boolean
  hasEmailAuth: boolean
  hasGoogleAuth: boolean
  playerId: string | null
}> {
  const { data: player } = await supabase
    .from('players')
    .select('id, hashed_password')
    .eq('email', email)
    .maybeSingle()

  if (!player) return { exists: false, hasEmailAuth: false, hasGoogleAuth: false, playerId: null }

  // hashed_password is '' for pure Google accounts
  // hashed_password is a bcrypt hash for email-registered accounts
  const hasEmailAuth = player.hashed_password !== '' && player.hashed_password !== null
  // If the account exists but has no password hash, it was created via Google
  // If it has a password hash, it was email-registered (may also have Google linked)
  // We determine Google by checking identities only when needed
  const hasGoogleAuth = !hasEmailAuth

  return { exists: true, hasEmailAuth, hasGoogleAuth, playerId: player.id }
}

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
    const { exists, hasEmailAuth, hasGoogleAuth } = await getPlayerProviderInfo(email)

    if (exists) {
      if (hasGoogleAuth && !hasEmailAuth) {
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
          hashed_password: pending.hashedPassword,
          elo: 0
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
          elo: 0,
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
        elo: 0
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

// GET /auth/check-email
router.get('/check-email', async (req: Request, res: Response) => {
  const { email } = req.query

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' })
    return
  }

  try {
    const { exists, hasEmailAuth, hasGoogleAuth } = await getPlayerProviderInfo(email)

    if (!exists) {
      res.json({ exists: false, provider: null })
      return
    }

    // Dual-auth: has both email password and Google → treat as email provider for login
    // Pure Google: no password hash → provider = 'google'
    res.json({
      exists: true,
      provider: hasEmailAuth ? 'email' : 'google'
    })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
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
    // Fast check using hashed_password column — no admin API call needed
    const { exists, hasEmailAuth, hasGoogleAuth } = await getPlayerProviderInfo(email)

    if (exists && hasGoogleAuth && !hasEmailAuth) {
      // Pure Google account — no password set
      res.status(401).json({ error: 'This account uses Google sign-in. Please use the Google button to log in.' })
      return
    }

    // Attempt Supabase email login (works for email-only AND dual-auth accounts)
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
        elo: profile?.elo ?? 0
      }
    })

  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /auth/token  (Google OAuth → arena JWT)
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
      // Brand-new Google user — insert player row
      const { error: insertError } = await supabase.from('players').insert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
        hashed_password: '',   // empty string = Google-only marker
        avatar_url: user.user_metadata?.avatar_url || null,
        elo: 0,
        wins: 0,
        losses: 0,
        total_matches: 0
      })
      if (insertError) {
        console.error('players insert error in /auth/token:', insertError)
      }
    } else if (profile.hashed_password === '' && user.user_metadata?.avatar_url && !profile.avatar_url) {
      // Existing Google account — update avatar if missing
      await supabase
        .from('players')
        .update({ avatar_url: user.user_metadata.avatar_url })
        .eq('id', user.id)
    }
    // NOTE: if profile.hashed_password is a bcrypt hash, the user registered with
    // email first and then linked Google — keep everything as-is, don't overwrite.

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
  } catch (err) {
    console.error('token error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user })
})

// GET /auth/profile  (legacy)
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