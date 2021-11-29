import express from "express";
import * as userRepository from "../public/database/repository/userRepository.js"
import { checkPassword } from "../public/database/repository/passwordRepository.js"
import { getDBConnection } from "../public/database/connectDB.js"

const router = express.Router();


router.post("/login", async (req, res, next) => {
    const db = await getDBConnection()
    const password = req.body.pw1
    var userId = -1
    var validationHasFailed = false

    // Get user id by email, stop with .next
    userId = await userRepository.getUserIdByEmail(req.body.email)

    if (!userId) {
        res.sendStatus(400)
        return next()
    }

    const successfulLogin = await checkPassword(password, userId)

    if (successfulLogin) {
        req.session.userId = userId
        req.session.isLoggedIn = true
        req.session.currentUser = req.body.email
        res.sendStatus(200);
    } else {
        res.sendStatus(400)
    } 
            
    
    
})

// todo toastr then timeout (make sure toastr cdns are in header and footer)
router.get("/logout", (req, res) => {
    req.session.isLoggedIn = false
    res.redirect("/")
})

export default router