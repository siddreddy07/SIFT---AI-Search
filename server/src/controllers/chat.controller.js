import * as chatService from '../services/chat.service.js'

export const createChat = async (req, res) => {
  try {
    const { id, userId, lastN } = req.body


    if (!userId || !lastN) {
      return res.status(400).json({ error: 'userId and title are required' })
    }
    const chat = await chatService.createChat({id, userId, lastN })
    res.status(201).json({success:true,message:chat})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getChat = async (req, res) => {
  try {
    const chat = await chatService.getChat(req.params.id, req.query.userId)
    if (!chat) return res.status(404).json({ error: 'Chat not found' })
    res.status(200).json({success:true,message:chat})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserChats = async (req, res) => {
  try {
    const chats = await chatService.getUserChats(req.params.userId)
    res.status(200).json({success:true,message:chats})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateChatTitle = async (req, res) => {
  try {
    const { title } = req.body
    if (!title) return res.status(400).json({ error: 'title is required' })
    const chat = await chatService.updateChatTitle(req.params.id, title)
    if (!chat) return res.status(404).json({ error: 'Chat not found' })
    res.status(200).json({success:true,message:chat})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteChat = async (req, res) => {
  try {
    const { userId } = req.query
    const deleted = await chatService.deleteChat(req.params.id, userId)
    if (!deleted) return res.status(404).json({ error: 'Chat not found' })
    res.status(200).json({ success: true ,message:'Deleted'})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
