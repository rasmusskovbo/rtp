import express from "express";
import * as userRepository from "../public/database/repository/userRepository.js"
import escape from "escape-html"

const router = express.Router();

router.get("/board/user", async (req, res) => {
    const userDetails = await userRepository.getUserDetailsByUserId(req.session.userId)

    userDetails ? res.send(userDetails) : res.sendStatus(500)
})

export default router