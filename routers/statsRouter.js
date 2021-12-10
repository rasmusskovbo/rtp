import express from "express"
import * as statsService from "../public/services/stats/statsService.js"

const router = express.Router()

router.get("/stats", async (req, res) => {
    // get stats from service
})