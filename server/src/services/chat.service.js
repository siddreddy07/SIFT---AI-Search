import { randomUUID } from 'crypto'
import { getDb } from '../config/db.js'
import { redis, redisKeys } from '../config/redis.js'
import { ChatSchema } from '../schemas/schema.js'
import { getChatMessages } from './message.service.js'
import { deleteFile } from './file.service.js'
import { ObjectId } from 'mongodb'

const COLLECTION = 'chats'
const TTL = 86400

export const createChat = async ({chatId,id=chatId, userId, title = 'New Chat' }) => {
  const oid = ObjectId.isValid(id) ? new ObjectId(id) : new ObjectId()
  const existing = await getChat(oid.toString())
  if (existing) {
    await getDb().collection(COLLECTION).updateOne({_id: new ObjectId(oid.toString())},{$set:{updatedAt:new Date()}})
    return { chatId: existing.id, userId: existing.userId }
  }

  const chatIdStr = oid.toString()

  const chat = ChatSchema.parse({
    _id: oid,
    userId,
    title,
    lastSummarizedMessageId: new ObjectId("000000000000000000000000"),
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  await getDb().collection(COLLECTION).insertOne(chat)

  await redis.setEx(redisKeys.chat(userId, chatIdStr), TTL, JSON.stringify({ ...chat, messages: [] }))

  return { chatId: chatIdStr, userId }
}

export const getChat = async (id, userId) => {
  if (userId) {
    const cached = await redis.get(redisKeys.chat(userId, id))
    if (cached) {
      const data = JSON.parse(cached)
      const chat = data.chat || data
      const messages = data.messages ?? []

      const allFileIds = messages.flatMap(m => (m.fileIds || []).map(fid => (fid.$oid || fid).toString()))
      if (allFileIds.length) {
        const files = await getDb().collection('files').find({ _id: { $in: allFileIds.map(id => new ObjectId(id)) } }).toArray()
        const fileMap = Object.fromEntries(files.map(f => [f._id.toString(), f]))
        for (const msg of messages) {
          msg.files = ((msg.fileIds || []).map(fid => (fid.$oid || fid).toString())).map(id => fileMap[id]).filter(Boolean)
        }
      }

      console.log('Cache Hit')
      return { ...chat, _id: id, messages }
    }
  }
  const chat = await getDb().collection(COLLECTION).findOne({ _id: new ObjectId(id) })

  console.log('Chat Found in DB :',chat)
  if (!chat) return null
  const messages = await getChatMessages(id, 30, userId)
  return { ...chat, messages }
}

export const getUserChats = async (userId) => {
  return getDb().collection(COLLECTION).find({ userId }).sort({ updatedAt: -1 }).toArray()
}

export const updateChatTitle = async (id, title) => {
  const { modifiedCount } = await getDb().collection(COLLECTION).updateOne(
    { id },
    { $set: { title, updatedAt: new Date() } }
  )
  if (!modifiedCount) return null
  return getChat(id)
}

export const upserChatSummaries = async({chatId})=>{

    const isChat = await getChat({chatId})
    
    if(!isChat) return null

  const chatSummaries =   await getDb().collection("chatSummaries").updateOne(
  { id:chatId },
  { $inc: { summaryCount: 1 }, $set: { updatedAt: new Date() } },
  { upsert: true }
) 
  return {count : chatSummaries.summaryCount}

}

export const deleteChat = async (id, userId) => {
  const { deletedCount } = await getDb().collection(COLLECTION).deleteOne({ id })
  if (!deletedCount) return false

  if (userId) await redis.del(redisKeys.chat(userId, id))

  const messages = await getDb().collection('messages').find({ chatId: id, fileIds: { $exists: true, $not: { $size: 0 } } }).toArray()
  const fileIds = messages.flatMap(m => (m.fileIds || []).map(fid => fid.toString()))
  const uniqueFileIds = [...new Set(fileIds)]

  const tasks = [getDb().collection('messages').deleteMany({ chatId: id })]
  if (userId && uniqueFileIds.length) {
    tasks.push(...uniqueFileIds.map(fileId => deleteFile(fileId, userId)))
  }
  await Promise.all(tasks)

  return true
}
