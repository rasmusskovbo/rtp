
import { getDBConnection } from "../../database/connectDB.js";

export async function createSleeperInfoByUserName(response, userId) {

    return await new Promise(async (resolve) => {

        try {
            const db = await getDBConnection()

            const [results, fields] = await db.execute(`
                    INSERT INTO sleeperInfo
                    (sleeper_username, sleeper_user_id, sleeper_avatar_url, user_id)
                    VALUES
                    (?, ?, ?, ?);
                `,
                [response.display_name, response.user_id, response.avatar, userId]
            )
            
            resolve(true)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    
    })

}