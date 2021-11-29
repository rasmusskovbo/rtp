import fetch from 'node-fetch'
import { getDBConnection } from "../database/connectDB.js";

const BASEURL_SLEEPER_USER_INFO = "https://api.sleeper.app/v1/user/" // + <username>

export async function createSleeperInfo(sleeperUserName, userId) {
    
    return await new Promise(async (resolve, reject) => {
    
        const url = BASEURL_SLEEPER_USER_INFO + sleeperUserName

        const resStream = await fetch(url)
        const res = await resStream.json()

        try {
            const db = await getDBConnection()

            const [results, fields] = await db.execute(`
                    INSERT INTO sleeperInfo
                    (sleeper_username, sleeper_user_id, sleeper_avatar_url, user_id)
                    VALUES
                    (?, ?, ?, ?);
                `,
                [res.display_name, res.user_id, res.avatar, userId]
            )
            
            resolve(true)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    
    })
}

export async function userIdHasSleeperUser(userId) {

    return await new Promise(async (resolve, reject) => {
        try {
            const db = await getDBConnection()

            const [results, fields] = await db.execute(`
                    SELECT * FROM sleeperInfo
                    WHERE user_id = ?
                `,
                [userId]
            )

            await results.length > 0 ? resolve(true) : resolve(false)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    
    })
    
}

export async function updateSleeperInfo(sleeperUserName, userId) {
    
    return await new Promise(async (resolve, reject) => {
    
        const url = BASEURL_SLEEPER_USER_INFO + sleeperUserName

        const resStream = await fetch(url)
        const res = await resStream.json()

        console.log(res)

        try {
            const db = await getDBConnection()

            const [results, fields] = await db.execute(`
                    UPDATE sleeperInfo
                    SET 
                        sleeper_username = ?,
                        sleeper_user_id = ?,
                        sleeper_avatar_url = ?
                    WHERE user_id = ?;
                `,
                [res.display_name, res.user_id, res.avatar, userId]
            )
            
            resolve(true)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    
    })
}

/*
function login() {
    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            pw1: document.getElementById("pw").value
        })
    }).then(res => {
        console.log("Response: " + res.status)
        if (res.status == 200) {
            toastr.success("Logging in...")
            setTimeout(() => location.href= "/profile", 1500);
        }
        if (res.status == 400) {
            toastr.info("Email or password not found. Please check and try again")
        }
        if (res.status == 500) {
            toastr.info("Login currently unavailable, try again later")
        }
    }) 
}


document.getElementById("login-button").addEventListener("click", login)
*/