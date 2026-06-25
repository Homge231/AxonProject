import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { getQuestion, getQuestions, createSession, timeoutSession } from '../controllers/gameController'

const router = Router()

// GET  /api/game/question   → 1 câu hỏi ngẫu nhiên (giữ nguyên, không xoá)
router.get('/question',  authMiddleware, getQuestion)

// GET  /api/game/questions  → batch 20 câu hỏi ngẫu nhiên (US-05)
router.get('/questions', authMiddleware, getQuestions)

// POST /api/game/session    → tạo session mới, trả về session_id
router.post('/session',  authMiddleware, createSession)

// POST /api/game/timeout    → khoá session khi hết giờ
router.post('/timeout',  authMiddleware, timeoutSession)

export default router