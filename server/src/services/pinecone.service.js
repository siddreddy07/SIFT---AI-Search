import { randomUUID } from "crypto"
import { Pinecone } from "@pinecone-database/pinecone"
import { embed, embedDocuments, embedQuery } from "./embedding.service.js"
import { split, splitWithMetadata } from "./splitter.service.js"

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })

function idx(namespace) {
  return pinecone.index(process.env.PINECONE_INDEX).namespace(namespace)
}

export async function upsert(data, namespace, isAiChat) {
  if (isAiChat) {
    const chunks = await split(data.content)
    const vectors = await embedDocuments(chunks)

    await idx(namespace).upsert({
      records: chunks.map((text, i) => ({
        id: randomUUID(),
        values: vectors[i],
        metadata: {
          chatId: data.chatId,
          text:text,
          summaryId:data._id,
          fromId: data.fromId.toString(),
          toId: data.toId.toString(),
        },
      })),
    })

    return true
  } else {
    const texts = data.map(msg => {
      const clean = msg.body.split(/(?:\r?\n)\s*On\s.*(?:\r?\n)\s*wrote:/i)[0].trim()
      return `From: ${msg.from}\n${clean}`
    })
    const vectors = await embed(texts)

    await idx(namespace).upsert({
      records: data.map((msg, i) => ({
        id: randomUUID(),
        values: vectors[i],
        metadata: {
          _id: msg._id.toString(),
          sourceId: msg.sourceId,
          threadId: msg.threadId,
          from: msg.from,
          to: msg.to,
        },
      })),
    })

    return true
  }
}

export async function upsertFileChunks(chunkDocs, namespace) {
  try {
    const pageContents = chunkDocs.map(c => c.pageContent)

    const vectors = await embed(pageContents)

    await idx(namespace).upsert({
      records: chunkDocs.map((c, i) => ({
        id: randomUUID(),
        values: vectors[i],
        metadata: {
          fileId: c.fileId.toString(),
          chunkIndex: c.chunkIndex,
          pageNumber: c.pageNumber,
          pageContent: c.pageContent,
        },
      })),
    })

    console.log(`Upserted ${chunkDocs.length} vectors to Pinecone namespace ${namespace}`)
  } catch (error) {
    console.error('Pinecone upsert failed:', error)
    throw error
  }
}

export async function deleteFileVectors(fileId, namespace) {
  try {
    await idx(namespace).deleteMany({
      filter: { fileId: { $eq: fileId } },
    })
    console.log(`Deleted Pinecone vectors for fileId ${fileId} in namespace ${namespace}`)
  } catch (error) {
    console.error('Pinecone delete failed:', error)
    throw error
  }
}

export async function search(queries, metadata = {}, namespace, topK = 5) {
  const filter = {}
  if (metadata.chatId) filter.chatId = { $eq: metadata.chatId }
  if (metadata.provider) filter.provider = { $eq: metadata.provider }
  if (metadata.content_id) filter.content_id = { $eq: metadata.content_id }
  if (metadata.fileId) filter.fileId = { $eq: metadata.fileId }

  const results = await Promise.all(
    queries.map(async (q) => {
      const [vector] = await embed([q], "search_query")
      const res = await idx(namespace).query({
        vector,
        topK,
        includeMetadata: true,
        ...(Object.keys(filter).length && { filter }),
      })
      return res.matches
    })
  )

  const seen = new Set()
  return results.flat().filter((m) => {
    const key = m.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
