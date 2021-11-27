import express from "express";
import { getDBConnection } from "../public/database/connectDB.js";
import { registerPassword } from "../public/database/passwordService.js";
const router = express.Router();

router.post("/register/user", async (req, res) => {
    if (req.body.pw1 == req.body.pw2) {
        const db = await getDBConnection()

        try {
            const [results, fields] = await db.execute(`
                INSERT INTO users 
                (email, username)
                VALUES
                (?, ?);
                `,
                [req.body.email, req.body.username]
            )
            await registerPassword(req.body.pw1, results.insertId) ? res.sendStatus(200) : res.sendStatus(500)
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400)
    }
})
 
export default router