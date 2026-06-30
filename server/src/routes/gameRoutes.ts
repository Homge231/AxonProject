import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { getQuestion, getQuestions, createSession, timeoutSession, submitAnswer } from '../controllers/gameController'

const router = Router()

router.get('/question', authMiddleware, getQuestion)
router.get('/questions', authMiddleware, getQuestions)
router.post('/session', authMiddleware, createSession)
router.post('/submit-answer', authMiddleware, submitAnswer)
router.post('/timeout', authMiddleware, timeoutSession)

export default router