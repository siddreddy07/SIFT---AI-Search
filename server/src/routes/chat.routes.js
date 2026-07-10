import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams } from 'express-zod-validations'
import * as chatController from '../controllers/chat.controller.js'
import { ChatSchema } from '../schemas/schema.js'

const router = Router()

router.post('/',
  validateBody(ChatSchema.pick({ userId: true, title: true })),
  chatController.createChat
)

router.get('/user/:userId',
  validateParams(z.object({ userId: z.string() })),
  chatController.getUserChats
)

router.get('/:id',
  validateParams(z.object({ id: z.string() })),
  chatController.getChat
)

router.patch('/:id/title',
  validateParams(z.object({ id: z.string() })),
  validateBody(ChatSchema.pick({ title: true })),
  chatController.updateChatTitle
)

router.delete('/:id',
  validateParams(z.object({ id: z.string() })),
  chatController.deleteChat
)

export default router
