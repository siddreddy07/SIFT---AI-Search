import { ObjectId } from 'mongodb'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, FILE_CHUNKS_COLLECTION } from '../config/constants.js'
import { getDb } from '../config/db.js'
import * as storageService from '../services/storage.service.js'
import { client } from '../config/llamaIndex.config.js'
import { splitWithMetadata } from './splitter.service.js'
import { FileChunkSchema } from '../schemas/schema.js'
import { upsertFileChunks, deleteFileVectors } from './pinecone.service.js'


const FILE_COLLECTION = 'files'

export const validateFile = (file) => {

  try {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`)
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 5MB limit')
    }

    return true
    
  } catch (error) {
      console.log("Error in File Service :",error)
      return false    
  }

}

export const deleteFile = async (fileId, userId) => {
  try {
    const file = await getDb().collection(FILE_COLLECTION).findOne({ _id: new ObjectId(fileId) })
    if (!file) {
      throw new Error('File not found')
    }

    const publicId = file.url.match(/\/v\d+\/(.+)\.\w+$/)?.[1]
    if (publicId) {
      await storageService.deleteFromCloudinary(publicId)
    }

    await Promise.all([
      getDb().collection(FILE_COLLECTION).deleteOne({ _id: new ObjectId(fileId) }),
      getDb().collection(FILE_CHUNKS_COLLECTION).deleteMany({ fileId: new ObjectId(fileId) }),
      deleteFileVectors(fileId, userId),
    ])

    console.log(`Deleted file ${fileId} for user ${userId}`)
    return true
  } catch (error) {
    console.log('Delete File Failed:', error)
    throw error
  }
}

export const getStatus = async () => {
  return {
    service: 'file',
    status: 'running',
    timestamp: new Date().toISOString()
  }
}


export const parseFile = async(fileId)=>{

  try {

    const file = await getDb().collection(FILE_COLLECTION).findOne({ _id: new ObjectId(fileId.toString()) })

    if(!file){
      console.log('No file Found in Db :',fileId)
      return false
    }

    console.log('File :',file)

const result = await client.parsing.parse({
  source_url: file.url,
  tier: "agentic",
  version: "latest",
  expand: ["markdown"],
});


    const docs = result.markdown.pages.map(page => ({
  pageContent: page.markdown,
  pageNumber: page.page_number ?? 0
}));

return docs

  } catch (error) {
    console.log('Parsing failed for File :',fileId, error.message)
    return false
  }

}


export const ingestFile = async(userId,metadata)=>{

  try {

    const docs = await parseFile(metadata.fileId)
    if (!docs) {
      throw new Error(`parseFile returned no docs for fileId: ${metadata.fileId}`)
    }
    const chunks = await splitWithMetadata(docs, metadata)

    const chunkDocs = chunks.map(({ pageContent, metadata: { fileId, chunkIndex, pageNumber } }) =>
      FileChunkSchema.parse({
        _id: new ObjectId(),
        fileId: new ObjectId(fileId),
        pageContent,
        chunkIndex,
        pageNumber,
        createdAt: new Date(),
      })
    )

    const [inserted] = await Promise.all([
      getDb().collection(FILE_CHUNKS_COLLECTION).insertMany(chunkDocs),
      upsertFileChunks(chunkDocs, userId),
    ])


    console.log(`Ingested ${inserted.insertedCount} chunks for file ${metadata.fileId}`)

    return chunkDocs

  } catch (error) {
    console.log('Ingest File Failed :',error)
    return false
  }

}