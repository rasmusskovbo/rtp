import express from "express";
import * as userRepository from "../public/database/repository/userRepository.js"
import { checkPassword } from "../public/database/repository/passwordRepository.js"
import { getDBConnection } from "../public/database/connectDB.js"
import escape from "escape-html"

const router = express.Router();


router.post("/auth/login", async (req, res, next) => {
    const db = await getDBConnection()
    const password = escape(req.body.pw1)
    const email = escape(req.body.email)
    var userId = -1

    // Get user id by email, stop with .next
    userId = await userRepository.getUserIdByEmail(email)

    if (!userId) {
        res.sendStatus(400)
        return next()
    }

    const successfulLogin = await checkPassword(password, userId)

    if (successfulLogin) {
        req.session.userId = userId
        req.session.isLoggedIn = true
        req.session.currentUser = email
        res.sendStatus(200);
    } else {
        res.sendStatus(400)
    } 
            
    
    
})

router.post("/auth/recover", async (req, res, next) => {
    // todo nodemailer reset link
})

// todo toastr then timeout (make sure toastr cdns are in header and footer)
router.get("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/")
})

export default router