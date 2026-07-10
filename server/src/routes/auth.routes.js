import { Router } from 'express'
import { loginController, logoutController, meController, refreshTokenController, signupController } from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import * as googleController from '../controllers/google.controller.js'

const router = Router()

router.post('/signup', signupController)
router.post('/login', loginController)
router.post('/logout',authenticate, logoutController)
router.post('/refresh-token', refreshTokenController)
router.get('/me', authenticate, meController)
router.get('/google', googleController.googleAuth)
router.get('/google/callback', googleController.googleCallback)
router.get('/integration/:userId', googleController.getIntegration)
router.get('/integrations/:userId', googleController.getAllIntegrations)
router.delete('/integration/:integrationId', googleController.revokeIntegration)

export default router