import {Router} from 'express'
import { updateUserController } from '../services/user.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.put('/update', authenticate, updateUserController)


export default router