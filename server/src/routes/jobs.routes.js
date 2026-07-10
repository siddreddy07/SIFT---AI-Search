import {Router} from 'express'
import { jobsController } from '../controllers/job.controller.js'

const router = Router()

router.get('/:jobId/events', jobsController.stream)

export default router