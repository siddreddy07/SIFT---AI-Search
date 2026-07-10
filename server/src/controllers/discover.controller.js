import { redis, redisKeys } from '../config/redis.js'
import { discoverService } from '../services/discover.service.js'

const CACHE_TTL = 3600
const CATEGORIES = ['Business', 'Sports', 'Technology', 'Entertainment', 'Health', 'Science', 'World']

export const getDiscoverNews = async (req, res) => {
  try {
    const cacheKeys = CATEGORIES.map(c => redisKeys.discover(c))
    const cached = await redis.mGet(cacheKeys)

    const allCached = cached.every(c => c !== null)
    if (allCached) {
      const data = {}
      console.log('Cache Hit for Discover News')
      CATEGORIES.forEach((cat, i) => { data[cat] = JSON.parse(cached[i]) })
      return res.status(200).json({ success: true, data })
    }

    const allData = await discoverService.fetchAllCategories()

    console.log('Fetched Discover News:', allData)

    const pipeline = CATEGORIES.map(cat =>
      redis.setEx(redisKeys.discover(cat), CACHE_TTL, JSON.stringify(allData[cat] || []))
    )
    await Promise.all(pipeline)

    res.status(200).json({ success: true, data: allData })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
