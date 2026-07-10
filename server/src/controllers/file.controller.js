import * as storageService from '../services/storage.service.js'
import * as fileService from '../services/file.service.js'

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const { userId,fileId } = req.body
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    console.log({userId,fileId,file:req.file})

    fileService.validateFile(req.file)

    
        console.log('Event Source in coming')

        res.setHeader("Content-type","text/event-stream")
        res.setHeader("Cache-Control","no-cache")
        res.setHeader("Connection","keep-alive")

    const result = await storageService.uploadFile(req.file, userId, fileId)
    res.status(200).json({ success: true, message: result })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params
    const { userId } = req.query
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }
    await fileService.deleteFile(fileId, userId)
    res.status(200).json({ success: true, message: 'File deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const healthCheck = async (_req, res) => {
  try {
    const status = await fileService.getStatus()
    res.status(200).json({ success: true, message: status })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
