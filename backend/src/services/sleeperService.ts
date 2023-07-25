import {getSleeperUserByUsername, SleeperUser} from "../clients/sleeperClient";
import {SleeperUserEntity} from "../database/entities/SleeperUserEntity";
import {getRepository} from "typeorm";

const BASEURL_SLEEPER_AVATAR = "https://sleepercdn.com/avatars/thumbs/"

// TODO impl redis instead
export async function getSleeperAvatarUrlBySleeperUsername(username: string): Promise<string> {
    const sleeperUserRepo = getRepository(SleeperUserEntity)

    const user = await sleeperUserRepo.findOne({
        where: {
            username: username.toLowerCase()
        }
    });

    if (user != null) {
        // Get the current date/time
        const now = new Date();

        // Calculate the difference in milliseconds
        const diff = now.getTime() - user.createdAt.getTime();

        // Convert the difference to hours
        const hours = diff / 1000 / 60 / 60;
        const bool = hours <= 24;

        if (hours <= 24) {
            // If the user was created within the last 24 hours, return the avatar URL
            return BASEURL_SLEEPER_AVATAR + user.avatar;
        } else {
            // If the user is more than 24 hours old, delete them and fetch updated data
            await sleeperUserRepo.delete(user.user_id);

            return await fetchAndInsertSleeperUser(username);
        }
    } else {
        return await fetchAndInsertSleeperUser(username)
    }

}

async function fetchAndInsertSleeperUser(username: string) : Promise<string> {
    const sleeperUserRepo = getRepository(SleeperUserEntity)
    const sleeperUser = await getSleeperUserByUsername(username);

    const newSleeperUser = {
        username: sleeperUser.username,
        user_id: sleeperUser.user_id,
        display_name: sleeperUser.display_name,
        avatar: sleeperUser.avatar
    };

    sleeperUserRepo.insert(newSleeperUser);

    return BASEURL_SLEEPER_AVATAR + newSleeperUser.avatar;
}