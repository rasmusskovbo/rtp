import express from "express";
import { checkPassword } from "../public/database/passwordService.js";
import { updatePassword } from "../public/database/passwordService.js";
import { getDBConnection } from "../public/database/connectDB.js";
import { updateSleeperInfo } from "../public/sleeper/sleeperService.js";
const router = express.Router();

router.post("/profile/updatepw", async (req, res) => {
    const pwords = req.body
    if (pwords.pw1 == pwords.pw2) {
        const db = await getDBConnection()
        var userId = req.session.userId
    
        const passwordValidated = await checkPassword(pwords.currentPw, userId)
    
        if (passwordValidated) {
            await updatePassword(pwords.pw1, userId)  ? res.sendStatus(200) : res.sendStatus(500)
        } else {
            res.sendStatus(400)
        } 
    } else {
        res.sendStatus(400)
    }
     
})

router.post("/profile/updateemail", async (req, res) => {
    const email = req.body.newEmail
    const userId = req.session.userId

    // validate email with regex use res.next(err) to break loop

    const db = await getDBConnection()

    try {
        if (db.execute(`
            UPDATE users 
            SET email = ?
            WHERE id = ?
            `,
            [email, userId]
        )) {
            req.session.currentUser = email
            res.sendStatus(200)
        }
        
    } catch {
        res.sendStatus(400)
    }
      
})

router.post("/profile/updatesleeper", async (req, res) => {
    const userId = req.session.userId

    await updateSleeperInfo(req.body.sleeperUser, userId) ? res.sendStatus(200) : res.sendStatus(400)
      
})

// todo toastr then timeout (make sure toastr cdns are in header and footer)
router.get("/logout", (req, res) => {
    req.session.isLoggedIn = false
    res.redirect("/")
})

export default router