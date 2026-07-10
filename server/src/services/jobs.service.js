

class jobService{

    clients = new Map()
    
    subscribe(jobId, res){
        res.setHeader("Content-type","text/event-stream")
        res.setHeader("Cache-Control","no-cache")
        res.setHeader("Connection","keep-alive")

        res.write(`data: ${JSON.stringify({ type: "connected for Job" })}\n\n`)

        this.clients.set(jobId,res)

        res.on("close",()=>{
            this.clients.delete(jobId)
        })
    }

    notify(jobId, data){
        const client = this.clients.get(jobId)

        if(!client){
            return;
        }

        client.write(`data: ${JSON.stringify(data)}\n\n`)
    }


}

export const jobsService = new jobService()