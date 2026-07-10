import { Queue } from "bullmq";
import { connection } from "../config/bullmq.connection.js";


export const bulMessageQueue = new Queue("bulkMessages",{
    removeOnComplete: true,
    connection,
})
