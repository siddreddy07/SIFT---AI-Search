import { Router } from 'express'
import { getHomePills } from '../controllers/homePill.controller.js'

const router = Router()

router.get('/', getHomePills)

export default router
