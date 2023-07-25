import axios from 'axios';

const BASEURL_SLEEPER_USER_INFO: string = "https://api.sleeper.app/v1/user/";

export interface SleeperUser {
    username: string,
    user_id: string,
    display_name: string,
    avatar: string
}

export async function getSleeperUserByUsername(sleeperUserName: string): Promise<SleeperUser> {
    const url: string = BASEURL_SLEEPER_USER_INFO + sleeperUserName;
    const response = await axios.get<SleeperUser>(url);
    return response.data;
}
