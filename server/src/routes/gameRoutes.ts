import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import {
  getQuestions,
  getCores,
  createSession,
  submitAnswer,
  timeoutSession,
  abandonSession,
  updateSessionCore
} from '../controllers/gameController'
import { submitFeedback } from '../controllers/feedbackController';

const router = Router()

router.get('/questions',      authMiddleware, getQuestions)
router.get('/cores',          authMiddleware, getCores)
router.post('/session',       authMiddleware, createSession)
router.post('/submit-answer', authMiddleware, submitAnswer)
router.post('/timeout',       authMiddleware, timeoutSession)
router.post('/abandon',       authMiddleware, abandonSession)
router.put('/session/core',   authMiddleware, updateSessionCore)
router.post('/feedback', submitFeedback);
export default router