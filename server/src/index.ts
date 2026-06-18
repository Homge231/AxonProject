import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)

app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'ARENA.ENG server running' })
})

app.use('/auth', authRoutes)
app.use('/api/user', authRoutes)

httpServer.listen(3000, () => {
  console.log('Server running on port 3000')
})
