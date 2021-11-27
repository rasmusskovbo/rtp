import express from "express";
import { checkPassword } from "../public/database/passwordService.js";
import { getDBConnection } from "../public/database/connectDB.js";
import toastr from "toastr"
const router = express.Router();

// todo investigate proper use of response/express to avoid sending multiple res.status through without use of flag
router.post("/login", async (req, res) => {
    const db = await getDBConnection()
    const password = req.body.pw
    var userId = -1
    var validationHasFailed = false

    // Get user id by email
    
    try {
        const [results, fields] = await db.execute(`
            SELECT id FROM users WHERE email = ?
            `, 
            [req.body.email]
        )

        userId = results[0].id
    } catch (err) {
        validationHasFailed = true
        res.sendStatus(400)
    }       

    if (!validationHasFailed) {
        const successfulLogin = await checkPassword(password, userId)

        if (successfulLogin) {
            req.session.userId = userId
            req.session.isLoggedIn = true
            req.session.currentUser = req.body.email
            res.sendStatus(200);
        } else {
            res.sendStatus(400)
        } 
            
    }
    
})

// todo toastr then timeout (make sure toastr cdns are in header and footer)
router.get("/logout", (req, res) => {
    req.session.isLoggedIn = false
    res.redirect("/")
})

export default router