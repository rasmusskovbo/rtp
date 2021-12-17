import { getDBConnection } from "../connectDB.js"

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

export async function getStandingsStats() {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [ results ] = await db.execute(`
                    SELECT * FROM standings_stats
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

export async function getWeeklyHighStats() {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [ results ] = await db.execute(`
                    SELECT * FROM weekly_high_stats
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

export async function getPlayerHighStats() {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [ results ] = await db.execute(`
                    SELECT * FROM player_high_stats
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

export async function getYearlyFinishesStats() {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [ results ] = await db.execute(`
                    SELECT * FROM yearly_finishes_stats
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



