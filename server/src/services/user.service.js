import { ObjectId } from "mongodb"
import { getDb } from "../config/db.js"
import { redis, redisKeys } from "../config/redis.js"

const USER_CACHE_TTL = 1800

class UserService {
  async getUser(userId) {
    const cached = await redis.get(redisKeys.user(userId))
    if (cached) {
      const user = JSON.parse(cached)
      await redis.setEx(redisKeys.user(userId), USER_CACHE_TTL, cached)
      return user
    }

    const user = await getDb().collection('user').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0, refreshToken: 0 } }
    )

    if (!user) throw new Error('User not found')

    await redis.setEx(redisKeys.user(userId), USER_CACHE_TTL, JSON.stringify(user))

    return user
  }

  async updateUser(userId, data) {
    const updates = { ...data, updatedAt: new Date() }

    await getDb().collection('user').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    )

    const updatedUser = await getDb().collection('user').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0, refreshToken: 0 } }
    )

    await redis.setEx(redisKeys.user(userId), USER_CACHE_TTL, JSON.stringify(updatedUser))

    return updatedUser
  }
}

export const userService = new UserService()
