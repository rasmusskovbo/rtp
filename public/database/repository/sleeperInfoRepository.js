
import { getDBConnection } from "../../database/connectDB.js";

const BASEURL_SLEEPER_AVATAR = "https://sleepercdn.com/avatars/thumbs/" // + <avatar_id>

export async function userHasSleeperUser(userId) {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [results, fields] = await db.execute(`
                    SELECT * FROM sleeperInfo
                    WHERE user_id = ?
                `,
                [userId]
            )
            
            await results.length > 0 ? resolve(true) : resolve(false)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    
    })

}

export async function updateSleeperInfoByUserId(sleeperUser, userId) {
    
    return await new Promise(async (resolve) => {

        try {
            const db = await getDBConnection()

            const [results, fields] = await db.execute(`
                    UPDATE sleeperInfo
                    SET 
                        sleeper_username = ?,
                        sleeper_user_id = ?,
                        sleeper_avatar_url = ?
                    WHERE user_id = ?;
                `,
                [sleeperUser.display_name, sleeperUser.user_id, BASEURL_SLEEPER_AVATAR + sleeperUser.avatar, userId]
            )
            
            resolve(true)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    
    })
}

export async function createSleeperInfoByUserid(sleeperUser, userId) {
    return await new Promise(async (resolve) => {

        try {
            const db = await getDBConnection()

            const [results, fields] = await db.execute(`
                    INSERT INTO sleeperInfo
                    (sleeper_username, sleeper_user_id, sleeper_avatar_url, user_id)
                    VALUES
                    (?, ?, ?, ?);
                `,
                [sleeperUser.display_name, sleeperUser.user_id, BASEURL_SLEEPER_AVATAR + sleeperUser.avatar, userId]
            )
            
            resolve(true)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    
    })

}

export async function getSleeperAvatarUrlForUserId(userId) {
    return await new Promise(async (resolve) => {
        
        try {
            const db = await getDBConnection()

            const [results, fields] = await db.execute(`
                    SELECT sleeper_avatar_url FROM sleeperInfo WHERE user_id = ?
                `,
                [userId]
            )
            
            await results.length > 0 ? resolve(results[0].sleeper_avatar_url) : resolve(null)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    })
}


