import { getDBConnection } from "../connectDB.js";

export async function getPosts() {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            const [results] = await db.execute(`
                SELECT 
                    id,
                    title,
                    content,
                    postedBy,
                    DATE_FORMAT(publishedTime, "%d-%m-%y, %H:%i") as publishedTime
                FROM posts
            `,
            )

            results ? resolve(results) : resolve(null)

        } catch (err) {
            console.log(err)
            resolve(null)
        }

    })
}

export async function insertPost(post) {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            await db.execute(`
                    INSERT INTO posts
                    (title, content, postedBy)
                    VALUES (?, ?, ?);
                `,
                [post.title, post.content, post.postedBy]
            )

            resolve(true)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    })
}

export async function deletePost(id) {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            await db.execute(`
                    DELETE FROM posts WHERE id = ?
                `,
                [id]
            )

            resolve(true)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    })
}

export async function updatePost(post) {
    return await new Promise(async (resolve) => {
        try {
            const db = await getDBConnection()

            await db.execute(`
                    UPDATE posts
                    SET
                    title = ?,
                    content = ?
                    WHERE id = ?
                `,
                [post.title, post.content, post.id]
            )

            resolve(true)

        } catch (err) {
            console.log(err)
            resolve(false)
        }
    })
}
