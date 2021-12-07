import { getDBConnection } from "../connectDB.js";

const MSG_EXPIRATION_IN_MONTHS = 1

export async function getMessages() {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [results] = await db.execute(`
                SELECT 
                    id,
                    username,
                    content,
                    owner,
                    avatar_url,
                    DATE_FORMAT(publishedTime, "%d-%m-%y, %H:%i") as publishedTime
                FROM messages
                WHERE
                    DATE(publishedTime) > DATE_SUB(NOW(), INTERVAL ${MSG_EXPIRATION_IN_MONTHS} MONTH)
            `,
            )

            results ? resolve(results) : resolve(null)

        } catch (err) {
            console.log(err)
            resolve(null)
        }

    })
}

export async function insertMessage(msg) {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [results] = await db.execute(`
                    INSERT INTO messages
                    (username, content, owner, avatar_url)
                    VALUES (?, ?, ?, ?);
                `,
        [msg.username, msg.content, msg.owner, msg.avatar]
            )

            const [ formattedMsg ] = await db.execute(`
                    SELECT
                        id,
                        username,
                        content,
                        owner,
                        avatar_url,
                        DATE_FORMAT(publishedTime, "%d-%m-%y, %H:%i") as publishedTime
                    FROM messages
                    WHERE id = ?
                `,
                [results.insertId]
            )

            resolve(formattedMsg[0])

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    })
}
