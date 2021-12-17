import express from "express"
import { getDBConnection } from "../public/database/connectDB.js"
import { registerPassword } from "../public/database/repository/passwordRepository.js"
import { isEmailValid } from "../util/validation.js"
import * as userRepo from "../public/database/repository/userRepository.js"
import escape from "escape-html"
const router = express.Router()

// refactor to use userRepository
router.post("/register/user", async (req, res, next) => {
    const email = escape(req.body.email)
    const pw1 = escape(req.body.pw1)
    const pw2 = escape(req.body.pw2)
    const username = escape(req.body.username)

    // Is email valid
    if (!isEmailValid(email)) {
        res.sendStatus(403)
        return next()
    }

    // Does passwords match
    if (pw1 === pw2) {
        const db = await getDBConnection()
        
        const userIdFound = await userRepo.getUserIdByEmail(email)
       
        // is email already in use for another account
        if (!userIdFound) {

            const results = await userRepo.createUser(email, username)

            // Was creation successful
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