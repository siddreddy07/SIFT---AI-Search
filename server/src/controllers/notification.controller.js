import sseManager from "../realtime/sse.manager.js"

export const notificationController = async(req,res)=>{

    try {

        const userId = req.user.userId

        console.log('Event Source in coming')

        res.setHeader("Content-type","text/event-stream")
        res.setHeader("Cache-Control","no-cache")
        res.setHeader("Connection","keep-alive")

        res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`)

        sseManager.addClient(userId,res)

        req.on("close",()=>{
            sseManager.removeClient(userId)
        })

    } catch (error) {
        console.log('Error inside Notification :',error)
        return res.status(500).json({success:false,messgae:'Notification Error'})
    }

}