import express from "express"
import { registerPassword } from "../database/repository/passwordRepository.js"
import { isEmailValid, passwordsMatch } from "../util/validation.js"
import * as userRepo from "../database/repository/userRepository.js"
import escape from "escape-html"
const router = express.Router()

// refactor to use userRepository
router.post("/register/user", async (req, res, next) => {
    const email = escape(req.body.email)
    const pw1 = escape(req.body.pw1)
    const pw2 = escape(req.body.pw2)
    const username = escape(req.body.username)

    if (!isEmailValid(email)) {
        res.sendStatus(403)
        return next()
    }

    if (passwordsMatch(pw1, pw2)) {
        // is email already in use for another account
        const userIdFound = await userRepo.getUserIdByEmail(email)
        if (!userIdFound) {
            // Was creation successful
            const results = await userRepo.createUser(email, username)
            if (results) {
                // Did password get saved
                return await registerPassword(pw1, results.insertId) ? res.sendStatus(200) : res.sendStatus(500)
            } else {
                res.sendStatus(500)
            }
        } else {
            res.sendStatus(409)
        }
    } else {
        res.sendStatus(400)
    }
})
 
export default router