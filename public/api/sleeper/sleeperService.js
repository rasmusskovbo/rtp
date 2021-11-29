import fetch from 'node-fetch'
import * as sleeperInfoRepo from '../../database/repository/sleeperInfoRepository.js'
import { getDBConnection } from "../../database/connectDB.js";

const BASEURL_SLEEPER_USER_INFO = "https://api.sleeper.app/v1/user/" // + <username>


// todo refactor to only provide api data
export async function createSleeperInfo(sleeperUserName, userId) {
    const url = BASEURL_SLEEPER_USER_INFO + sleeperUserName
    const resStream = await fetch(url)
    const res = await resStream.json()

    if (await sleeperInfoRepo.createSleeperInfoByUserName(res, userId)) {
        return true
    } else {
        return false
    }

}

// Todo refactor to repo
export async function userIdHasSleeperUser(userId) {

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

export async function updateSleeperInfo(sleeperUserName, userId) {
    
    return await new Promise(async (resolve) => {
    
        const url = BASEURL_SLEEPER_USER_INFO + sleeperUserName

        const resStream = await fetch(url)
        const res = await resStream.json()

        console.log(res)

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
                [res.display_name, res.user_id, res.avatar, userId]
            )
            
            resolve(true)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    
    })
}