import express from "express"
import * as statsService from "../services/stats/statsService.js"

const router = express.Router()

router.get("/stats/rtp-score", async (req, res) => {
    const stats = await statsService.getAndCalculateRTPStats()

    stats ? res.status(200).send(stats) : res.sendStatus(500)
})

router.get("/stats/standings", async (req, res) => {
    const stats = await statsService.getAndMapStandingsStats()

    stats ? res.status(200).send(stats) : res.sendStatus(500)
})

router.get("/stats/weekly-high", async (req, res) => {
    const stats = await statsService.getAndMapWeeklyHighStats()

    stats ? res.status(200).send(stats) : res.sendStatus(500)
})

router.get("/stats/player-high", async (req, res) => {
    const stats = await statsService.getAndMapPlayerHighStats()

    stats ? res.status(200).send(stats) : res.sendStatus(500)
})

router.get("/stats/yearly-finishes", async (req, res) => {
    const stats = await statsService.getAndMapYearlyFinishesStats()

    stats ? res.status(200).send(stats) : res.sendStatus(500)
})

export default router