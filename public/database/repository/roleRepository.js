import { getDBConnection } from "../connectDB.js";

export async function getRoleByUserId(userId) {

    return await new Promise(async (resolve) => {
        const db = await getDBConnection()

        try {
            const [ results ] = await db.execute(`
                SELECT isAdmin FROM roles WHERE user_id = ?
                `,
                [userId]
            )

            db.end()
            results.length > 0 ? resolve(true) : resolve(false)

        } catch (err) {
            console.log(err)
            resolve(null)
        }

    })
}