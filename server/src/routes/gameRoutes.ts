import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { getQuestion, createSession, timeoutSession } from '../controllers/gameController'

const router = Router()

// GET  /api/game/question  → random question from DB
router.get('/question', authMiddleware, getQuestion)

// POST /api/game/session   → create active session, returns session_id
router.post('/session', authMiddleware, createSession)

// POST /api/game/timeout   → lock session on timeout (US-04 [BE])
router.post('/timeout', authMiddleware, timeoutSession)

export default router