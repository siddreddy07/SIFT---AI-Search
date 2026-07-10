import { getDb } from '../config/db.js'
import { ObjectId } from 'mongodb'
import { upsert } from "./pinecone.service.js"

export const ingestMessages = async (docs) => {
  try {

    if (docs.isAiChat) {
      const { _id: summaryId } = docs

      const summary = await getDb().collection('summaries').findOne({ _id: new ObjectId(summaryId) })

      await upsert(summary, summary.userId, true)

    } else {

      const { integrationId, documentIds } = docs
  
      const query = { integrationId: new ObjectId(integrationId) }
      if (documentIds?.length) {
        query._id = { $in: documentIds.map(id => new ObjectId(id)) }
      }
  
      const messages = await getDb().collection('universal_messages').find(query).toArray()
  
      console.log('Messages :',messages)
  
  
      const allBatches = []
      for (let i = 0; i < messages.length; i += 20) {
        allBatches.push(messages.slice(i, i + 20))
      }
      for (let i = 0; i < allBatches.length; i += 2) {
        await Promise.all(allBatches.slice(i, i + 2).map(b => upsert(b, b[0].userId, false)))
      }
      console.log('Ingested :',messages.length)

    }
  } catch (error) {
    console.error("Ingest failed:", error)
    throw error
  }
}
