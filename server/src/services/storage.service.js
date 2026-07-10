import cloudinary from "../config/cloudinary.js"
import streamifier from "streamifier";
import { ObjectId } from 'mongodb'
import { getDb } from '../config/db.js'
import { FileSchema } from '../schemas/schema.js'
import { ingestFileQueue } from "../queues/ingest.queue.js";

const FILE_COLLECTION = 'files'

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log('Cloudinary delete result:', result)
    return result
  } catch (error) {
    console.error('Cloudinary delete failed:', error)
    throw error
  }
}

export const uploadFile = async (file, userId,fileId) => {
  const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw'

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ai_search_files',
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    streamifier.createReadStream(file.buffer).pipe(uploadStream)
  })

  const doc = FileSchema.parse({
    _id: new ObjectId(fileId),
    userId,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: result.secure_url,
    createdAt: new Date(),
  })
  const fileresult = await getDb().collection(FILE_COLLECTION).insertOne(doc)

  const job = await ingestFileQueue.add("ingestFile",{userId,fileId})

  return { jobId : job.id, fileId: doc._id.toString(), url: result.secure_url, message: 'File uploaded successfully' }
}