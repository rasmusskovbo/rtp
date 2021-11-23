import express from "express";
import bcrypt from "bcrypt";
import { getDBConnection } from "../public/database/connectDB.js";
const saltRounds = 10;
const router = express.Router();

router.post("/registerUser", (req, res) => {
    const db = getDBConnection()

    const SQL = db.query({
        sql:`
        INSERT INTO users 
        (username)
        VALUES
        (?);
        `,
        values: [req.body.username]
    },
    function (error, results, fields) {
        console.log(error, results, fields);
        res.send(results);
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
    })

    db.end

})

// only if does not exist
router.post("/registerPassword", (req, res) => {
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.pass, salt, function(err, hash) {
            
            const db = getDBConnection()
    
            const SQL = db.query({
                sql:`
                INSERT INTO passwords 
                (hash, user_id)
                VALUES
                (?, ?);
                `,
                values: [hash, req.body.user_id]
            },
            function (error, results, fields) {
                console.log(error, results, fields);
              // error will be an Error if one occurred during the query
              // results will contain the results of the query
              // fields will contain information about the returned results fields (if any)
            })

            db.end
        });
    });
})
 
export default router