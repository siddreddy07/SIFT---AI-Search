import { createClient } from "redis"

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
})

redis.on("error", (err) => console.error("Redis error:", err))
redis.on("connect", () => console.log("Redis connected"))

await redis.connect()

// Redis key namespace — colons act as folders in RedisInsight/SCAN
export const redisKeys = {
  chat:    (userId, chatId) => `chats:${userId}:${chatId}`,
  summary: (userId, chatId) => `summaries:${userId}:${chatId}`,
  user:    (userId)         => `users:${userId}`,
  integrations: (userId)    => `integrations:${userId}`,
  suggestions: (userId)     => `suggestions:${userId}`,
  discover: (category)      => `discover:${category}`,
}
