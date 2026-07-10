import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
})

export async function split(text) {
  return splitter.splitText(text)
}

export async function splitWithMetadata(docs, metadata) {
  let chunkIndex = 0
  const result = []
  for (const { pageContent, pageNumber } of docs) {
    const pageChunks = await splitter.splitText(pageContent)
    for (const text of pageChunks) {
      result.push({ pageContent: text, metadata: { ...metadata, chunkIndex: chunkIndex++, pageNumber } })
    }
  }
  return result
}
