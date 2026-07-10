import * as messageService from '../services/message.service.js'

export const createMessage = async (req, res) => {
  try {
    const { chatId, role, content, sources } = req.body
    if (!chatId || !role || !content) {
      return res.status(400).json({ error: 'chatId, role, and content are required' })
    }
    const message = await messageService.createMessage({ chatId, role, content, sources })
    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getChatMessages = async (req, res) => {
  try {
    const messages = await messageService.getChatMessages(req.params.chatId)
    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateMessage = async (req, res) => {
  try {
    const message = await messageService.updateMessage(req.params.id, req.body)
    if (!message) return res.status(404).json({ error: 'Message not found' })
    res.json(message)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteMessage = async (req, res) => {
  try {
    const deleted = await messageService.deleteMessage(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Message not found' })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
