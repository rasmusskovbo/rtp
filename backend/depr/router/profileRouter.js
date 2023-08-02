import express from "express"
import { getDBConnection } from "../database/connectDB.js"
import {passwordsMatch, isEmailValid} from "../util/validation.js"
import { isAuthorized } from '../util/authentication.js'
import * as passwordRepository from "../database/repository/passwordRepository.js"
import * as userRepository from "../database/repository/userRepository.js"
import * as sleeperService from "../resources/sleeper/sleeperService.js"

const router = express.Router()

router.put("/profile/pw", isAuthorized, async (req, res) => {
    const pw1 = escape(req.body.pw1)
    const pw2 = escape(req.body.pw2)
    const currentPw = escape(req.body.currentPw)

    if (passwordsMatch(pw1, pw2)) {
        let userId = req.session.userId
    
        const passwordValidated = await passwordRepository.checkPassword(currentPw, userId)
    
        if (passwordValidated) {
            await passwordRepository.updatePassword(pw1, userId)  ? res.sendStatus(200) : res.sendStatus(500)
        } else {
            res.sendStatus(400)
        } 
    } else {
        res.sendStatus(400)
    }
     
})

router.put("/profile/email", isAuthorized, async (req, res, next) => {
    const email = escape(req.body.newEmail)
    const userId = escape(req.session.userId)

    if (!isEmailValid(email)) {
        res.sendStatus(400)
        return next()
    }

    const updateSuccessful = await userRepository.updateEmailById(email, userId)

    if (updateSuccessful) {
        req.session.currentUser = email
        res.sendStatus(200)
    } else {
        res.sendStatus(400)
    }
      
})

router.put("/profile/sleeper", isAuthorized, async (req, res) => {
    const updateSuccessful = await sleeperService.fetchAndUpdateSleeperInfo(escape(req.body.sleeperUser), escape(req.session.userId))
    
    updateSuccessful ? res.sendStatus(200) : res.sendStatus(400)
    
})

router.get("/profile/sleeperAvatarUrl", isAuthorized, async (req, res) => {
    const avatarUrl = await sleeperService.getSleeperAvatarUrlByUserId(req.session.userId)

    avatarUrl ? res.send(avatarUrl) : res.send("N/A")
})

router.get("/profile/userDetails", isAuthorized, async (req, res) => {
    const userDetails = await userRepository.getUserDetailsByUserId(req.session.userId)

    userDetails ? res.send(userDetails) : res.sendStatus(500)
})


router.get("/logout", isAuthorized, (req, res, next) => {
    req.session.loggedInUser = false
    res.redirect("/")
    next()
})

export default router