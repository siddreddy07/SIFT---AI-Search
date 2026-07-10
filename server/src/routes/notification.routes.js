import express from 'express'
import { notificationController } from '../controllers/notification.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = express.Router()


router.get("/notification/stream",authenticate,notificationController)


export default router