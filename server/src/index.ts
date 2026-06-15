import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)

app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'ARENA.ENG server running' })
})

httpServer.listen(3000, () => {
  console.log('Server running on port 3000')
<<<<<<< HEAD
})
=======
})
>>>>>>> d3afa7fb45e22d1f6234c2e379ffd821955514c6
