import { Router } from 'express'
import { getUserProfile, updateUserProfile, getVocabAnalytics, getAiCoachAnalysis } from '../controllers/userController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/profile', authMiddleware, getUserProfile)
router.patch('/profile', authMiddleware, updateUserProfile)
router.get('/analytics', authMiddleware, getVocabAnalytics)
router.post('/ai-coach', authMiddleware, getAiCoachAnalysis)

export default router