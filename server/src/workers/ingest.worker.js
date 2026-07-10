import { Worker } from "bullmq";
import { connection } from "../config/bullmq.connection.js";
import { connectDb } from "../config/db.js";
import { ingestMessages } from "../services/ingest.service.js";
import { ingestFile } from "../services/file.service.js";

await connectDb()

export const ingestMessageWorker = new Worker(
  "ingestBulkMessages",
  async (job) => {
    console.log("ingestMessages Worker processing job", job.id, job.data);

    await ingestMessages(job.data)
  },
  { connection }
)

ingestMessageWorker.on("completed", (job) => {
  console.log(`ingestMessages job ${job.id} completed`)
})

ingestMessageWorker.on("failed", (job, err) => {
  console.error(`ingestMessages job ${job.id} failed:`, err)
})

export const ingestFileWorker = new Worker(
  "ingestFile",
  async (job) => {
    console.log("ingestFile Worker processing job", job.id, job.data);

    const { userId, fileId } = job.data
    const doc = await ingestFile(userId, { fileId })
    console.log('File Ingested Successfully :',doc.fileId)
  },
  { connection }
)

ingestFileWorker.on("completed", (job) => {
  console.log(`ingestFile job ${job.id} completed`)
})

ingestFileWorker.on("failed", (job, err) => {
  console.error(`ingestFile job ${job.id} failed:`, err)
})
