import { Router } from 'express'
import { getDiscoverNews } from '../controllers/discover.controller.js'

const router = Router()

router.get('/news', getDiscoverNews)

export default router
