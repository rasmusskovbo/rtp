import express from "express"
import * as postRepo from "../public/database/repository/postRepository.js"
const router = express.Router()
import { isAdmin } from '../util/authentication.js'

const mockPosts = [
    {
        id: 1,
        title: "The playoffs are set!",
        preview: "This is a preview of the post...",
        postedBy: "Wildf1re",
        publishedTime: "01/08/2021, 19:20"
    },
    {
        id: 2,
        title: "Winner winner, chicken dinner!",
        preview: "This is a preview of the post...",
        postedBy: "sebastianorup",
        publishedTime: "09/02/2021, 23:03"
    }
]

router.post("/dashboard/posts", isAdmin,async (req, res) => {
    const newPost = req.body
    newPost.postedBy = req.session.currentUser
    const success = await postRepo.insertPost(newPost)

    success ? res.sendStatus(200) : res.sendStatus(500)
})

router.get("/dashboard/posts", isAdmin, async (req, res) => {
    const posts = await postRepo.getPosts()

    posts ? res.send(posts) : res.sendStatus(500)
})

router.get("/dashboard/mock", (req, res) => {
    res.send( mockPosts )
})

router.delete("/dashboard/posts/:postId", isAdmin, async (req, res) => {
    const IDofPostToDelete = req.params.postId

    await postRepo.deletePost(IDofPostToDelete) ? res.sendStatus(200): res.sendStatus(500)
})

router.put("/dashboard/posts/", isAdmin, async (req, res) => {
    const updatedPost = req.body

    await postRepo.updatePost(updatedPost) ? res.sendStatus(200): res.sendStatus(500)
})

export default router