import express from "express";
import bcrypt from "bcrypt";
import { getDBConnection } from "../connectDB.js";
const saltRounds = 10;
const router = express.Router();

export async function registerPassword(pass, userid) {
    return await new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(pass, salt, async function(err, hash) {
                try {
                    const db = await getDBConnection()
        
                    await db.execute(`
                        INSERT INTO passwords 
                        (hash, user_id)
                        VALUES
                        (?, ?);
                        `,
                        [hash, userid]
                    )

                    resolve(true)
                    
                } catch (err) {
                    console.log(err)
                    reject(false)
                }
                
            })
        })
    })
}

export async function updatePassword(pass, userid) {
    return await new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(pass, salt, async function(err, hash) {
                try {
                    const db = await getDBConnection()
        
                    await db.execute(`
                        UPDATE passwords
                        SET hash = ?
                        WHERE user_id = ?
                        `,
                        [hash, userid]
                    )
                    resolve(true)
                    
                } catch (err) {
                    console.log(err)
                    reject(false)
                }
                
            })
        })
    })
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
        console.log(err)
        return false
    } 
}
 
export default router