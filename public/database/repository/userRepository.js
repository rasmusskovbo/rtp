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

export async function getUserDetailsByUserId(userId) {

    return await new Promise(async (resolve) => {
        const db = await getDBConnection()


        try {
            const [results, fields] = await db.execute(`
                SELECT username, email FROM users WHERE id = ?
                `,
                [userId]
            )

            console.log("Results in repo: ", results)

            const userDetails = await {
                username: results[0].username,
                email: results[0].email,
            }

            console.log("User details in repo: ", userDetails)

            if (results.length > 0) {
                resolve(userDetails)
            } else {
                resolve(null)
            }

        } catch (err) {
            console.log(err)
            resolve(null)
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