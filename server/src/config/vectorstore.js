import { CohereEmbeddings } from "@langchain/cohere"
import { Pinecone } from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone"

export const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: "embed-english-v3.0",
})

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

export const index = pinecone.Index(process.env.PINECONE_INDEX)

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex: index,  
})
