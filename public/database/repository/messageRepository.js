import { getDBConnection } from "../connectDB.js";

export async function getMessages() {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [results] = await db.execute(`
                SELECT * FROM messages
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
    try {
        const db = await getDBConnection()

        db.execute(`
                INSERT INTO messages
                (username, content, owner, publishedDate, publishedTime, avatar_url)
                VALUES
                (?, ?, ?, ?, ?, ?);
            `,
            [msg.username, msg.content, msg.owner, msg.publishedDate, msg.publishedTime, msg.avatar]
        )

        console.log(`Inserted ${msg} successfully to DB`)
    } catch (err) {
        console.log(err)
    }

}
