import { Queue } from "bullmq";
import { connection } from "../config/bullmq.connection.js";


export const ingestBulkMessageQueue = new Queue("ingestBulkMessages",{
    removeOnComplete: true,
    connection,
})


export const ingestFileQueue = new Queue("ingestFile",{
    removeOnComplete:true,
    connection
})
