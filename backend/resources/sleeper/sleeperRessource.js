import fetch from 'node-fetch'

const BASEURL_SLEEPER_USER_INFO = "https://api.sleeper.app/v1/user/" // + <username>

export async function getSleeperUserByUsername(sleeperUserName) {
    const url = BASEURL_SLEEPER_USER_INFO + sleeperUserName
    const resStream = await fetch(url)
    return await resStream.json()
}
