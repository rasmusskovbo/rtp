import * as statsRepo from "../../database/repository/statsRepository.js"
import { getDBConnection } from "../../database/connectDB.js";

// Points pr...
const WIN = 5
const SECOND_PLACE = 3
const THIRD_PLACE = 2
const PLAYOFF = 1
const PINK = -5
const TOILET = -3
g
export async function getAndCalculateStats() {

    const db = await getDBConnection()

    const stats = await statsRepo.getPlayoffStats()

    console.log("Stats Service", stats);

}
