import express from "express";
import * as userRepo from "../public/database/repository/userRepository.js"
import * as msgRepo from "../public/database/repository/messageRepository.js"

const router = express.Router();

router.get("/board/user", async (req, res) => {
    const userDetails = await userRepo.getUserDetailsByUserId(req.session.userId)

    userDetails ? res.send(userDetails) : res.sendStatus(500)
})

router.get("/board/messages", async (req, res) => {
    const messages = await msgRepo.getMessages()

    messages ? res.send(messages) : res.sendStatus(500)
})

export default router

