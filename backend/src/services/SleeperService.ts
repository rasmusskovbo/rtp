import {getSleeperUserByUsername} from "../clients/SleeperClient";
import {RedisCache} from "../cache/RedisClient";

const BASEURL_SLEEPER_AVATAR = "https://sleepercdn.com/avatars/thumbs/";
const CACHE_FIELD = "avatarUrl";
const AVATAR_EXPIRATION = 60 * 60 * 24;

export class SleeperService {
    private cache: RedisCache;

    constructor() {
        this.cache = new RedisCache();
    }

    public async getSleeperAvatarUrlBySleeperUsername(username: string): Promise<string> {
        const cachedAvatarUrl = await this.cache.get(username, CACHE_FIELD)

        return cachedAvatarUrl ? cachedAvatarUrl : await this.fetchAndInsertSleeperUser(username)
    }

    private async fetchAndInsertSleeperUser(username: string): Promise<string> {
        try {
            const sleeperUser = await getSleeperUserByUsername(username);

            if (sleeperUser) {
                const avatarUrl = BASEURL_SLEEPER_AVATAR + sleeperUser.avatar
                this.cache.put(username,avatarUrl, AVATAR_EXPIRATION, CACHE_FIELD)

                return avatarUrl
            } else {
                console.log("Unable to save fetch data for Sleeper user: " + username);
                return "N/A"
            }
        } catch (err) {
            console.error(`An error occurred while fetching and inserting Sleeper user: ${err}`);
            return "N/A";
        }
    }
}
