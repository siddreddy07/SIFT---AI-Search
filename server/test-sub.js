import 'dotenv/config'
import { connectDb, getDb } from './src/config/db.js'

const [, , integrationId, userId] = process.argv

if (!integrationId || !userId) {
  console.log('Usage: node test-sub.js <integrationId> <userId>')
  process.exit(1)
}

await connectDb()

const { setupSubscriptions } = await import('./src/services/google.service.js')

const result = await setupSubscriptions(integrationId, userId)

console.log('Subscription result:', JSON.stringify(result, null, 2))

process.exit(0)
