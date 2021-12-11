import express from "express"
import * as statsService from "../public/services/stats/statsService.js"

const router = express.Router()

router.get("/stats/rtp-score", async (req, res) => {
    const stats = await statsService.getAndCalculateStats()

    stats ? res.status(200).send(stats) : res.sendStatus(500)
})

export default router