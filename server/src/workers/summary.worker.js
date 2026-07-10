import { Worker } from "bullmq";




export const summaryWorker = new Worker(
    "ingestSummary",
    async(job)=>{

        console.log('Ingest Summary is in Progress')

    }
)