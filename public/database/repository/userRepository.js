import { getDBConnection } from "../connectDB.js";

export async function getUserIdByEmail(email) {
    return await new Promise(async (resolve) => {
        const db = await getDBConnection()

        try {
            const [ results ] = await db.execute(`
                SELECT id FROM users WHERE email = ?
                `, 
                [email]
            )

            db.end()
            return results ? resolve(results[0].id) : resolve(null)
            
        } catch (err) {
            console.log(err)
            resolve(null);
        }       

    })

}

export async function getUserDetailsByUserId(userId) {

    return await new Promise(async (resolve) => {
        const db = await getDBConnection()


        try {
            const [ results ] = await db.execute(`
                SELECT username, email FROM users WHERE id = ?
                `,
                [userId]
            )

            const userDetails = {
                id: userId,
                username: results[0].username,
                email: results[0].email,
            }

            db.end()
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
            console.log(err)
            resolve(false)
        }      

    })

}
export async function createUser(email, username) {

    return await new Promise(async (resolve) => {

        const db = await getDBConnection()

        try {
            const [results, fields] = await db.execute(`
                INSERT INTO users 
                (email, username)
                VALUES
                (?, ?);
                `,
                [email, username]
            )

            resolve(results)
        } catch (error) {
            console.log(error)
            resolve(null)
        }   

    })

}

