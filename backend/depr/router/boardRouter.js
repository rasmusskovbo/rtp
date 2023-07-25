import express from "express"
import * as userRepo from "../database/repository/userRepository.js"
import * as msgRepo from "../database/repository/messageRepository.js"
import { isAuthorized } from '../util/authentication.js'

const router = express.Router()

router.get("/board/user", isAuthorized,  async (req, res) => {
    const userDetails = await userRepo.getUserDetailsByUserId(req.session.userId)

    userDetails ? res.send(userDetails) : res.sendStatus(500)
})

router.get("/board/messages", isAuthorized, async (req, res) => {
    const messages = await msgRepo.getMessages()

    messages ? res.send(messages) : res.sendStatus(500)
})

export default router

