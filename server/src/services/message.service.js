import { randomUUID } from 'crypto'
import { getDb } from '../config/db.js'
import { redis, redisKeys } from '../config/redis.js'
import { MessageSchema, SummarySchema } from '../schemas/schema.js'
import { summarizeMessages } from '../ai/summary.js'
import { ObjectId } from 'mongodb'
import { CHAT_COLLECTION } from '../config/constants.js'
import { summaryQueue } from '../queues/summary.queue.js'


const COLLECTION = 'messages'
const TTL = 86400

export const createMessage = async ({msgId, chatId, role, content, sources=[], userId, fileIds }) => {

  console.log({msgId, chatId, role, content, fileIds,userId})

  const message = MessageSchema.parse({
    _id: new ObjectId(msgId),
    chatId,
    role,
    content,
    sources,
    fileIds: fileIds?.map(id => new ObjectId(id)),
    createdAt: new Date(),
  })
  await getDb().collection(COLLECTION).updateOne(
    { _id: new ObjectId(msgId) },
    { $set: message },
    { upsert: true }
  )

  if (userId) {
    const key = redisKeys.chat(userId, chatId)

    const cached = await redis.get(key)
    if (cached) {
      const data = JSON.parse(cached)
      data.messages = data.messages || []
      data.messages.push(message)
      console.log('Role :',role)
      if (data.messages.length > 30) {
        data.messages = data.messages.slice(-30)
        if (role === "assistant") {
          await maybeQueueSummary({ chatId, userId })
        }
      }
      await redis.setEx(key, TTL, JSON.stringify(data))
    }
  }

  return message
}



async function maybeQueueSummary({chatId, userId}) {

  try {

    const chat = await getDb().collection(CHAT_COLLECTION).findOne({
      _id: new ObjectId(chatId.toString())
    })

    console.log('Chat :',chat)

    if (!chat) return

    const fromId = chat.lastSummarizedMessageId || new ObjectId("000000000000000000000000")

    const nextBatch = await getDb().collection('messages').find({
      chatId: chatId.toString(),
      _id: { $gt: fromId }
    })
      .sort({ _id: 1 })
      .limit(30)
      .toArray()

    if (nextBatch.length === 30) {

      console.log('Going to Summary Queue')

      const toId = nextBatch[nextBatch.length - 1]._id

      await summaryQueue.add('ingestSummary', {
        chatId,
        userId,
        from: fromId,
        to: toId
      })

      await getDb().collection(CHAT_COLLECTION).updateOne(
        { _id: new ObjectId(chatId.toString()) },
        { $set: { lastSummarizedMessageId: toId } }
      )
    }

    console.log('Not Yet 30 messages')
    return

  } catch (error) {
    console.error('maybeQueueSummary error:', error)
    return
  }

}

export const getChatMessages = async (chatId, limit = 20, userId) => {
  if (userId) {
    const cached = await redis.get(redisKeys.chat(userId, chatId))
    if (cached) {
      const data = JSON.parse(cached)
      return data.messages.slice(-limit)
    }
  }

  const messages = await getDb().collection(COLLECTION).aggregate([
    { $match: { chatId } },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    { $sort: { createdAt: 1 } },
    {
      $lookup: {
        from: 'files',
        localField: 'fileIds',
        foreignField: '_id',
        as: 'files',
      },
    },
  ]).toArray()

  if (userId && messages.length) {
    await redis.setEx(redisKeys.chat(userId, chatId), TTL, JSON.stringify({ messages }))
  }

  return messages
}

export const getChatMessagesFromRange = async ({ chatId, userId, from: fromId, to: toId }) => {
  try {
    const messages = await getDb().collection(COLLECTION).find({
      chatId,
      _id: { $gt: new ObjectId(fromId), $lte: new ObjectId(toId) }
    })
      .sort({ _id: 1 })
      .toArray()

    if (!messages.length) return null

    const summaryResult = await summarizeMessages(messages)

    const summaryDoc = SummarySchema.parse({
      _id: new ObjectId(),
      chatId,
      userId,
      content: JSON.stringify(summaryResult),
      fromId: new ObjectId(fromId),
      toId: new ObjectId(toId),
      createdAt: new Date(),
    })

    await getDb().collection('summaries').insertOne(summaryDoc)

    await getDb().collection('chats').updateOne({_id:new ObjectId(chatId)},{$set:{lastSummarizedMessageId: new ObjectId(toId)}})

    const { content, ...rest } = summaryDoc

    await ingestBulkMessages({ ...rest, isAiChat: true })

    return rest
  } catch (error) {
    console.error('getChatMessagesFromRange error:', error)
    throw error
  }
}

export const getMessage = async (id) => {
  return getDb().collection(COLLECTION).findOne({ id })
}

export const updateMessage = async (id, updates) => {
  const allowed = {}
  if (updates.content !== undefined) allowed.content = updates.content
  if (updates.sources !== undefined) allowed.sources = updates.sources
  if (updates.role !== undefined) allowed.role = updates.role
  if (!Object.keys(allowed).length) return null

  const { modifiedCount } = await getDb().collection(COLLECTION).updateOne(
    { id },
    { $set: allowed }
  )
  if (!modifiedCount) return null
  return getMessage(id)
}

export const deleteMessage = async (id) => {
  const { deletedCount } = await getDb().collection(COLLECTION).deleteOne({ id })
  return deletedCount > 0
}
