import {getSleeperUserByUsername} from "../clients/sleeperClient";

const BASEURL_SLEEPER_AVATAR = "https://sleepercdn.com/avatars/thumbs/"

// TODO Save in DB again as to only fetch once a week etc
export async function getSleeperAvatarUrlBySleeperUsername(username: string): Promise<string> {
    const sleeperUser = await getSleeperUserByUsername(username);
    return BASEURL_SLEEPER_AVATAR + sleeperUser.avatar;
}