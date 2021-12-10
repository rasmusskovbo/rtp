import express from "express"
import * as statsService from "../public/services/stats/statsService.js"

const router = express.Router()

router.get("/stats/rtp-score", async (req, res) => {
    const stats = await statsService.getAndCalculateStats()

    console.log("Router: ", stats)

    res.send(stats)
})

export default router