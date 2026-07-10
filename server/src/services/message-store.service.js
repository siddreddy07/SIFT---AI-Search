import { getDb } from '../config/db.js'
import { ObjectId } from 'mongodb'
import { UniversalMessageSchema } from '../schemas/schema.js'

const COLLECTION = 'universal_messages'

const JOB_ALERT_SENDERS = [
  /jobalerts?\s*<.*noreply@linkedin/i,
  /jobalerts?\s*<.*noreply@glassdoor/i,
  /indeed.*jobalerts?/i,
  /naukri.*job.?alert/i,
]

const BLOCKED_SENDERS = [
  /newsletter@/i,
  /marketing@/i,
  /mailchim(p|ps)/i,
  /sendgrid/i,
  /@\w+\.recruitplatform\./i,
]

const BLOCKED_SUBJECTS = [
  /welcome to (?!.*(interview|application|offer))/i,
  /thank you for (subscribing|signing|joining)(?!.*(interview|application|offer))/i,
  /subscription (confirmed|activated|receipt)/i,
  /weekly digest/i,
  /your (weekly|daily) (digest|roundup|summary)/i,
]

function isBlocked(content) {
  const from = (content.from || "").toLowerCase()
  const subject = (content.subject || "").toLowerCase()

  if (JOB_ALERT_SENDERS.some(r => r.test(from))) return true
  if (BLOCKED_SENDERS.some(r => r.test(from))) return true
  if (BLOCKED_SUBJECTS.some(r => r.test(subject))) return true

  return false
}

export const storeMessages = async ({ provider, integrationId, contents }) => {
  try {

    const filtered = contents.filter(c => !isBlocked(c))
    if (!filtered.length) {
      console.log(`All ${contents.length} messages blocked — nothing stored`)
      return []
    }

    const docs = filtered.map((content) =>
      UniversalMessageSchema.parse({
        _id: new ObjectId(),
        userId: content.userId,
        integrationId: new ObjectId(integrationId),
        source: provider,
        sourceId: content.sourceId,
        threadId: content.threadId || null,
        from: content.from,
        to: content.to || [],
        subject: content.subject || null,
        body: content.body,
        metadata: content.metadata || {},
        timestamp: content.timestamp || new Date(),
        createdAt: new Date(),
      })
    )

    await getDb().collection(COLLECTION).insertMany(docs)

    const grouped = new Map()
    for (const msg of docs) {
      const key = `${msg.integrationId}:${msg.source}`
      if (!grouped.has(key)) {
        grouped.set(key, {
          integrationId: msg.integrationId,
          source: msg.source,
          messageIds: [],
        })
      }
      grouped.get(key).messageIds.push(msg._id)
    }
    const result = [...grouped.values()]

    console.log('Result inside Store Messages :',result)

    console.log(`Stored ${docs.length} messages from ${provider}`)
    return result
  } catch (error) {
    console.error(`Failed to store messages from ${provider}:`, error)
    throw error
  }
}

// export const storeMessage = async ({ provider, integrationId, content }) => {
//   const docs = await storeMessages({ provider, integrationId, contents: [content] })
//   return docs[0]
// }

export const getUniversalMessages = async ({ userId,messageId, provider, limit = 50, skip = 0 }) => {
  const query = { userId }
  if (provider) query.source = provider
  if (messageId) query._id = new ObjectId(messageId)

  const email = await getDb().collection(COLLECTION)
                             .findOne(query)
  
  const threadMessages = await getDb().collection(COLLECTION)
                                      .find({userId,threadId:email.threadId},
                                        {
                                          projection: {
                                            _id:1,
                                            from:1,
                                            to:1,
                                            subject:1,
                                            body:1
                                          }
                                        }
                                      )
                                      .sort({_id:-1})
                                      .toArray()

  return threadMessages
}
