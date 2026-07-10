import { getDb } from './src/config/db.js'
import { connectDb } from './src/config/db.js'
import { ObjectId } from 'mongodb'
import { summarizeMessages } from './src/ai/summary.js'
import { SummarySchema } from './src/schemas/schema.js'
import { upsert } from './src/services/pinecone.service.js'

const CHAT_ID = '6a3ab77690e9da0acc2c98bf'
const USER_ID = '6a396260436372d8e4ad48f6'
const FROM_ID = '000000000000000000000000'
const TO_ID = '6a3cdd80d87b01ef0185b094'

async function main() {
  await connectDb()

  const messages = await getDb().collection('messages').find({
    chatId: CHAT_ID,
    _id: { $gt: new ObjectId(FROM_ID), $lte: new ObjectId(TO_ID) }
  })
    .sort({ _id: 1 })
    .toArray()

  if (!messages.length) {
    console.log('No messages found in range')
    return
  }

  console.log(`Found ${messages.length} messages`)

  const summaryResult = await summarizeMessages(messages)
  console.log('Summary:', summaryResult)

  const summaryDoc = SummarySchema.parse({
    _id: new ObjectId(),
    chatId: new ObjectId(CHAT_ID),
    userId: new ObjectId(USER_ID),
    content: JSON.stringify(summaryResult),
    fromId: new ObjectId(FROM_ID),
    toId: new ObjectId(TO_ID),
    createdAt: new Date(),
  })

  await getDb().collection('summaries').insertOne(summaryDoc)
  console.log('Summary stored:', summaryDoc._id.toString())

  return 

  // await getDb().collection('chats').updateOne(
  //   { _id: new ObjectId(CHAT_ID) },
  //   { $set: { lastSummarizedMessageId: new ObjectId(TO_ID) } }
  // )
  // console.log('lastSummarizedMessageId updated')

  // await upsert(summaryDoc, summaryDoc.userId, true)
  // console.log('Embeddings & Pinecone upsert done')
}

main().catch(console.error)
