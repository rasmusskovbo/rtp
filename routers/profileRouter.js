import express from "express"
import { getDBConnection } from "../public/database/connectDB.js"
import * as passwordRepository from "../public/database/repository/passwordRepository.js"
import * as userRepository from "../public/database/repository/userRepository.js"
import * as sleeperService from "../public/api/sleeper/sleeperService.js"

const router = express.Router()

router.put("/profile/pw", async (req, res) => {
    const pwords = req.body
    if (pwords.pw1 == pwords.pw2) {
        const db = await getDBConnection()
        var userId = req.session.userId
    
        const passwordValidated = await passwordRepository.checkPassword(pwords.currentPw, userId)
    
        if (passwordValidated) {
            await passwordRepository.updatePassword(pwords.pw1, userId)  ? res.sendStatus(200) : res.sendStatus(500)
        } else {
            res.sendStatus(400)
        } 
    } else {
        res.sendStatus(400)
    }
     
})


// validate email with regex use res.next(err) to break loop
router.put("/profile/email", async (req, res) => {
    const email = req.body.newEmail
    const userId = req.session.userId

    const db = await getDBConnection()

    const updateSuccessful = await userRepository.updateEmailById(email, userId)

    if (updateSuccessful) {
        req.session.currentUser = email
        res.sendStatus(200)
    } else {
        res.sendStatus(400)
    }
      
})

router.put("/profile/sleeper", async (req, res) => {
    const userId = req.session.userId

    const userIdHasSleeperUser = await sleeperService.userIdHasSleeperUser(userId)

    if (userIdHasSleeperUser) {
        await sleeperService.updateSleeperInfo(req.body.sleeperUser, userId) ? res.sendStatus(200) : res.sendStatus(400)
    } else {
        await sleeperService.createSleeperInfo(req.body.sleeperUser, userId) ? res.sendStatus(200) : res.sendStatus(400)
    }
    
      
})

router.get("/logout", (req, res) => {
    req.session.isLoggedIn = false
    res.redirect("/")
})

export default router