import { success } from 'zod'
import { getDb } from '../config/db.js'
import { redis, redisKeys } from '../config/redis.js'
import { homepillService } from '../services/homePill.service.js'

const CACHE_TTL = 30 * 60

async function getLatestMessages(userId) {
  const integrations = await getDb().collection('integrations')
    .find({ userId, status: 'active' })
    .project({ _id: 1 })
    .toArray()

    console.log('Integrations :',integrations)

  if (!integrations.length) return []

  const ids = integrations.map(i => i._id)
  const messages = await getDb().collection('universal_messages')
    .find({ integrationId: { $in: ids } })
    .sort({ timestamp: -1 })
    .limit(10)
    .project({ from: 1, to: 1, subject: 1, body: 1, source: 1, timestamp: 1, _id: 1 })
    .toArray()

  return messages
}

export const getHomePills = async (req, res) => {
  try {
    const { userId } = req.query

    if (!userId) return res.status(400).json({ error: 'userId is required' })
    const cacheKey = redisKeys.suggestions(userId)

    console.log("Inside Homepill controller")

    const cached = await redis.get(cacheKey)

    if(cached){
      console.log('Cache Hit for Pills')
      return res.status(200).json({success:true,data: JSON.parse(cached)})
    }

    const messages = await getLatestMessages(userId)

    const pills = await homepillService({ messages })
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(pills))
    console.log('Pills : ',pills)
    res.status(200).json({ success: true, data: pills })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
