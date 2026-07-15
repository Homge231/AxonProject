import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import gameRoutes from './routes/gameRoutes'
import rateLimit from 'express-rate-limit'
import { initQuestionCron } from './cron/questionCron'
dotenv.config()

// Initialize cron jobs
initQuestionCron()

const app = express()
app.set('trust proxy', 1)
app.use(cors({
  origin: [
    'https://naenra.xyz',
    'https://www.naenra.xyz',
    'https://axonproject.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

const httpServer = createServer(app)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
})

app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'ARENA.ENG server running' })
})

app.use('/auth/login', authLimiter)
app.use('/auth/register', authLimiter)
app.use('/auth/resend-otp', authLimiter)
app.use('/auth/verify-otp', authLimiter)

app.use('/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/game', gameRoutes)

import { Server } from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { MatchRoom } from './rooms/MatchRoom'

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer
  })
})

gameServer.define('match_room', MatchRoom)

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000

gameServer.listen(PORT).then(() => {
  console.log(`Colyseus Server running on port ${PORT}`)
})
