import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams } from 'express-zod-validations'
import * as messageController from '../controllers/message.controller.js'
import { MessageSchema } from '../schemas/schema.js'

const router = Router()

router.post('/',
  validateBody(MessageSchema.pick({ chatId: true, role: true, content: true, sources: true })),
  messageController.createMessage
)

router.get('/chat/:chatId',
  validateParams(z.object({ chatId: z.string() })),
  messageController.getChatMessages
)

router.patch('/:id',
  validateParams(z.object({ id: z.string() })),
  validateBody(MessageSchema.pick({ content: true, sources: true, role: true }).partial()),
  messageController.updateMessage
)

router.delete('/:id',
  validateParams(z.object({ id: z.string() })),
  messageController.deleteMessage
)

export default router
