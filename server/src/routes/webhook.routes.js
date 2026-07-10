import { Router } from 'express'
import * as webhookController from '../controllers/webhook.controller.js'

const router = Router()

router.post('/gmail', webhookController.handleGmailPush)
router.post('/calendar', webhookController.handleCalendarNotification)

export default router
