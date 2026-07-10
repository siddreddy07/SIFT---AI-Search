import { Pinecone } from "@pinecone-database/pinecone"
import { embed } from "./src/services/embedding.service.js"

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
const index = pinecone.index({ name: process.env.PINECONE_INDEX })

const namespace = process.argv[2] || "user-123"
const query = process.argv[3] || "brother"

const [vector] = await embed([query], "search_query")

const result = await index.namespace(namespace).query({
  vector,
  topK: 5,
  includeMetadata: true,
  includeValues: false,
})

console.log(JSON.stringify(result.matches, null, 2))
