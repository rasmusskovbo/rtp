import { getDBConnection } from "../connectDB.js";

export async function getUserIdByEmail(email) {

    return await new Promise(async (resolve) => {

        const db = await getDBConnection()

        try {
            const [results, fields] = await db.execute(`
                SELECT id FROM users WHERE email = ?
                `, 
                [email]
            )
    
            resolve(await results[0].id)
            
        } catch (err) {
            resolve(null);
        }       

    })

}

export async function updateEmailById(email, userId) {

    return await new Promise(async (resolve) => {

        const db = await getDBConnection()

        try {
            await db.execute(`
                UPDATE users 
                SET email = ?
                WHERE id = ?
                `,
                [email, userId]
            )
            
            resolve(true)

        } catch {
            resolve(false)
        }      

    })

}