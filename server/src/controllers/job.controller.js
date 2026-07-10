import { jobsService } from "../services/jobs.service.js"


class jobController {

    stream(req,res){
        const {jobId} = req.params
        jobsService.subscribe(jobId,res)
    }

}


export const jobsController = new jobController()