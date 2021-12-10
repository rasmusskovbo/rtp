import { getDBConnection } from "../connectDB.js";

export async function getPlayoffStats() {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [ results ] = await db.execute(`
                    SELECT * FROM rtp_score_stats
                `,
            )

            db.end()
            resolve(results)

        } catch (err) {
            console.log(err)
            resolve(null)
        }
    })
}



