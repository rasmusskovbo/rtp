import { getDBConnection } from "../connectDB";

export async function getPlayoffStats() {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [ results ] = await db.execute(`
                    SELECT * FROM playoff_stats
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



