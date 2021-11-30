import * as sleeperRepo from '../../database/repository/sleeperInfoRepository.js'
import * as sleeperRessource from './sleeperRessource.js'

const BASEURL_SLEEPER_USER_INFO = "https://api.sleeper.app/v1/user/" // + <username>

export async function fetchAndUpdateSleeperInfo(sleeperUserName, userId) {
    const sleeperUser = await sleeperRessource.getSleeperUserByUsername(sleeperUserName)

    if (sleeperUser) {
        if (await sleeperRepo.userHasSleeperUser(userId)) {
            return await sleeperRepo.updateSleeperInfoByUserId(sleeperUser, userId)
        } else {
            return await sleeperRepo.createSleeperInfoByUserid(sleeperUser, userId)
        }
    } else {
        return false 
    }

}

export async function getSleeperAvatarUrlByUserId(userId) {
    const avatarURL = await sleeperRepo.getSleeperAvatarUrlByUserId(userId)

    return avatarURL ? avatarURL : false
}