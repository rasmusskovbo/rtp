import * as statsRepo from "../../database/repository/statsRepository.js"
import * as sleeperService from "../../resources/sleeper/sleeperService.js"
import util from "util";

const PTS_PR_WIN = 5
const PTS_PR_SECOND_PLACE = 3
const PTS_PR_THIRD_PLACE = 2
const PTS_PR_PLAYOFF = 1
const PTS_PR_PINK = -5
const PTS_PR_TOILET = -2

export async function getAndCalculateRTPStats() {
    const stats = await statsRepo.getPlayoffStats()

    const avatarResults = await fetchAvatarsAsync(stats)

    stats.map((statLine, index) => {
        statLine.rtp_score =
            (statLine.wins * PTS_PR_WIN) +
            (statLine.second_place * PTS_PR_SECOND_PLACE) +
            (statLine.third_place * PTS_PR_THIRD_PLACE) +
            (statLine.playoff_appearances * PTS_PR_PLAYOFF) +
            (statLine.toilet_wins * PTS_PR_TOILET) +
            (statLine.pinks * PTS_PR_PINK)

        statLine.avatarURL = avatarResults[index]
    })

    return stats
}

export async function getAndMapStandingsStats() {
    const stats = await statsRepo.getStandingsStats()

    const avatarResults = await fetchAvatarsAsync(stats)
    mapAvatars(stats, avatarResults)

    return stats
}

export async function getAndMapWeeklyHighStats() {
    const stats = await statsRepo.getWeeklyHighStats()

    const avatarResults = await fetchAvatarsAsync(stats)
    mapAvatars(stats, avatarResults)

    return stats
}

export async function getAndMapPlayerHighStats() {
    const stats = await statsRepo.getPlayerHighStats()

    const avatarResults = await fetchAvatarsAsync(stats)
    mapAvatars(stats, avatarResults)

    return stats
}

export async function getAndMapYearlyFinishesStats() {
    return await statsRepo.getYearlyFinishesStats()
}


// TODO rewrite to use single db connection.
async function fetchAvatarsAsync(stats) {
    const userIds = stats.map(statLine => statLine.user_id)
    const promises = userIds.map(async (id) => sleeperService.getSleeperAvatarUrlByUserIdAsync(id))
    return await Promise.all(promises)
}

function mapAvatars(stats, avatarResults) {
    stats.map((statLine, index) => {
        statLine.avatarURL = avatarResults[index]
    })
}

