import { Worker } from "bullmq";
import { connection } from "../config/bullmq.connection.js";
import { connectDb } from "../config/db.js";
import { storeMessages } from "../services/message-store.service.js";
import { ingestBulkMessageQueue } from "../queues/ingest.queue.js";

await connectDb()

export const bulkMessagesWorker = new Worker(
  "bulkMessages",
  async (job) => {
    console.log("bulkMessages Worker in progress");

    const result = await storeMessages({
      provider: job.data.provider,
      integrationId: job.data.integrationId,
      contents: job.data.contents,
    })

    console.log('result :',result)

    for (const group of result) {
      console.log('Group :',group)
      await ingestBulkMessageQueue.add("ingestBulkMessages", {
        integrationId: group.integrationId,
        source: group.source,
        documentIds: group.messageIds,
      })
      console.log('Enqueued to ingestBulkMessages')
    }
  },
  { connection }
);
