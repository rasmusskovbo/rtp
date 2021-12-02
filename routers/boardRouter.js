import express from "express";
import * as userRepo from "../public/database/repository/userRepository.js"
import * as msgRepo from "../public/database/repository/messageRepository.js"

const MESSAGE_EXPIRATION_IN_DAYS = 30
const router = express.Router();

router.get("/board/user", async (req, res) => {
    const userDetails = await userRepo.getUserDetailsByUserId(req.session.userId)

    userDetails ? res.send(userDetails) : res.sendStatus(500)
})

router.get("/board/messages", async (req, res) => {
    const messages = await msgRepo.getMessages()

    messages ? res.send(messages) : res.sendStatus(500)
})

// TODO
function messageIsOutdated(msgDate) {

    const currentDate = Date()

    const day = parseInt(msgDate[0] + msgDate[1])
    console.log(day)
    const month = parseInt(msgDate[3] + msgDate[4])
    console.log(month)
    const year = parseInt(msgDate[6] + msgDate[7] + msgDate[8] + msgDate[9])
    console.log(year)

    const msgDateFormatted = new Date(year, month, day)

    console.log("current", currentDate)
    console.log("here")
    console.log("other", msgDateFormatted)

}

export default router

/*
if month difference < 1
    if (expiration in days - current date) > dayofmonthformatted
        return true
    else
        return false
else
    return false



    12 - 11 = 1
    12 - 10 = 2
    02 - 12 = -10

        if (monthDifference <= 1) {
        const dayOfMonth = msgDate[0] + msgDate[1]
        const dayOfMonthFormatted = parseInt(dayOfMonth)

        return (MESSAGE_EXPIRATION_IN_DAYS - currentDate) > dayOfMonthFormatted
    }
 */



