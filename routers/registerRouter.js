import express from "express";
import { getDBConnection } from "../public/database/connectDB.js";
import { registerPassword } from "../public/database/passwordService.js";
const router = express.Router();

router.post("/register/user", (req, res) => {
    if (req.body.pw1 == req.body.pw2) {
        const db = getDBConnection()

        db.query({
            sql:`
            INSERT INTO users 
            (email, username)
            VALUES
            (?, ?);
            `,
            values: [req.body.email, req.body.username]
        },
        function (error, results, fields) {
            if (error) {
                res.sendStatus(500);
            } else {
                registerPassword(req.body.pw1, results.insertId)
                res.sendStatus(200)
            }
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
        })

        db.end

    } else {
        res.sendStatus(400)
    }
})
 
export default router