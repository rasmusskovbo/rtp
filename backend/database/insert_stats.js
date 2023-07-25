import { getDBConnection } from "./connectDB.js"
import fs from "fs"

const db = await getDBConnection()

const player_high = fs.readFileSync("public_old/database/statements/player_high_stats_aggr_insert", {encoding: "utf-8"})
const rtp_score = fs.readFileSync("public_old/database/statements/rtp_score_stats_aggr_insert", {encoding: "utf-8"})
const standings = fs.readFileSync("public_old/database/statements/standings_stats_aggr_insert", {encoding: "utf-8"})
const weekly_high = fs.readFileSync("public_old/database/statements/weekly_high_stats_aggr_insert", {encoding: "utf-8"})
const yearly_finishes = fs.readFileSync("public_old/database/statements/yearly_finishes_stats_aggr_insert", {encoding: "utf-8"})

db.execute(player_high)
/*
db.execute(rtp_score)
db.execute(standings)
db.execute(weekly_high)
db.execute(yearly_finishes)

 */

db.end()