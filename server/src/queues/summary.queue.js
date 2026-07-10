import { Queue } from "bullmq";
import {connection} from '../config/bullmq.connection.js'


export const summaryQueue = new Queue('ingestSummary',{
    removeonComplete: true,
    connection
})