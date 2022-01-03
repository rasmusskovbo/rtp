import express from 'express'
const router = express.Router()
import { isAuthorizedOrigin } from '../util/authentication.js'

router.post("/session", isAuthorizedOrigin,(req, res) => {
    res.send(req.session)
})

export default router