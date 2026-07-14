import { Router } from 'express'
import { getUserProfile, updateUserProfile, getVocabAnalytics } from '../controllers/userController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/profile', authMiddleware, getUserProfile)
router.patch('/profile', authMiddleware, updateUserProfile)
router.get('/analytics', authMiddleware, getVocabAnalytics)

export default router