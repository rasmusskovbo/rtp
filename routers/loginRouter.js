import express from "express";
import bcrypt from "bcrypt";
import { connectSqlite } from "../database/connectSqlite.js";
const router = express.Router();

router.post("/login", async (req, res) => {
    const db = await connectSqlite()
    const userId = req.body.id
    
    const hashInfo = await db.all(`
        SELECT hash FROM secrets WHERE id = ?
        `,
        userId
    )

    const hash = hashInfo.map(hash => hash.hash)

    bcrypt.compare(req.body.pass, hash[0], function(err, result) {
        if (result) {
            req.session.loggedIn = true;
            res.sendStatus(200);
        } else {
            res.sendStatus(400)
        }
    });        
})

// todo toastr then timeout (make sure toastr cdns are in header and footer)
router.get("/logout", (req, res) => {
    req.session.loggedIn = false;
    res.redirect("/")
})

export default router