import { QueueEvents } from "bullmq";
import { connection } from "./bullmq.connection.js";
import { jobsService } from "../services/jobs.service.js";

export const queueEvents = new QueueEvents('ingestFile', {
  connection: connection
})

await queueEvents.waitUntilReady()


queueEvents.on('active',({jobId})=>{
    jobsService.notify(jobId,{status:'processing'})
})

queueEvents.on("completed", ({ jobId }) => {
  jobsService.notify(jobId, {
    status: "completed",
  });
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  jobsService.notify(jobId, {
    status: "failed",
    reason: failedReason,
  });
});