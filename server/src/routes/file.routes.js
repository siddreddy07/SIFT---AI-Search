import { Router } from 'express'
import { upload } from '../config/multer.js'
import * as fileController from '../controllers/file.controller.js'

const router = Router()

router.post('/upload',
  upload.single('file'),
  fileController.uploadFile
)

router.delete('/:fileId',
  fileController.deleteFile
)

router.get('/health',
  fileController.healthCheck
)

export default router
