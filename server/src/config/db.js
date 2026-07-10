import { MongoClient } from "mongodb";

let client = null
let db = null

export const connectDb = async () => {
  if (db) return db

  client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()

  db = client.db(process.env.DB_NAME || 'ai-search')
  console.log('DB Connected')
  return db
}

export const getDb = () => {
  if (!db) throw new Error('Database not connected. Call connectDb() first.')
  return db
}