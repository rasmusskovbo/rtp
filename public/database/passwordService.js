import express from "express";
import bcrypt from "bcrypt";
import { getDBConnection } from "./connectDB.js";
const saltRounds = 10;
const router = express.Router();

export function registerPassword(pass, userid) {
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(pass, salt, function(err, hash) {
            
            const db = getDBConnection()
    
            const SQL = db.query({
                sql:`
                INSERT INTO passwords 
                (hash, user_id)
                VALUES
                (?, ?);
                `,
                values: [hash, userid]
            },
            function (error, results, fields) {
                
              // error will be an Error if one occurred during the query
              // results will contain the results of the query
              // fields will contain information about the returned results fields (if any)
            })

            db.end
        });
    });
}

export async function checkPassword(pass, userId) {
    try {
        const db = await getDBConnection()

        const [results, fields] = await db.execute(`
            SELECT hash FROM passwords WHERE user_id = ?
            `,
            [userId]
        )

        const hash = results[0].hash

        return bcrypt.compare(pass, hash)

    } catch (err) {
        return false
    } 
}
 
export default router