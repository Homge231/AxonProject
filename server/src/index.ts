import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'

dotenv.config()

const app = express()
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

app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'ARENA.ENG server running' })
})

app.use('/auth', authRoutes)
app.use('/api/user', userRoutes)


httpServer.listen(3000, () => {
  console.log('Server running on port 3000')
})