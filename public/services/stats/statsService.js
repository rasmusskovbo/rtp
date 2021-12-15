import * as statsRepo from "../../database/repository/statsRepository.js"
import * as sleeperService from "../../resources/sleeper/sleeperService.js"

const BASEURL_SLEEPER_AVATAR = "https://sleepercdn.com/avatars/thumbs/" // + <avatar_id>

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

async function fetchAvatarsAsync(stats) {
    const sleeperUsernames = stats.map(statLine => statLine.sleeper_username)

    const promises = sleeperUsernames.map(async (username) => sleeperService.getSleeperAvatarUrlBySleeperUsernameAsync(username))
    const avatarIds = await Promise.all(promises)

    return avatarIds.map(avatarId => BASEURL_SLEEPER_AVATAR + avatarId)
}

function mapAvatars(stats, avatarResults) {
    stats.map((statLine, index) => {
        statLine.avatarURL = avatarResults[index]
    })
}

