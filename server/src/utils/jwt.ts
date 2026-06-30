import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required')
}

const JWT_SECRET: jwt.Secret = jwtSecret

export function generateToken(payload: {
  id: string
  email: string
  username: string
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET)
}
