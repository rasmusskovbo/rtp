import express from "express"
import { createPage } from '../util/render.js'
import { isAdmin, isAuthorized } from '../util/authentication.js'

const router = express.Router()

/// Ready HTML pages using createPage js ///
const frontpagePage = createPage("frontpage/frontpage.html", {
    title: "Home of Road To Pink | The League of Would-be Champions"
})

const loginPage = createPage("login/login.html", {
    title: "Login | Road To Pink"
})

const registerPage = createPage("register/register.html", {
    title: "Register | Road To Pink"
})

const profilePage = createPage("profile/profile.html", {
    title: "Profile | Road To Pink"
})

const leagueBoardPage = createPage("league_board/league_board.html", {
    title: "League Board | Road To Pink"
})

const dashboardPage = createPage("dashboard/dashboard.html", {
    title: "Dashboard | Road To Pink"
})

const statsPage = createPage("stats/stats.html", {
    title: "Index | Road To Pink"
})


/// HTTP Requests ///
router.get("/", (req, res) => {
    res.send(frontpagePage)
})

router.get("/login", (req, res) => {
    res.send(loginPage)
})

router.get("/register", (req, res) => {
    res.send(registerPage)
})

router.get("/profile", isAuthorized, (req, res) => {
    res.send(profilePage)
})

router.get("/league-board", isAuthorized, (req, res) => {
    res.send(leagueBoardPage)
})

router.get("/dashboard", isAdmin, (req, res) => {
    res.send(dashboardPage)
})

router.get("/stats", isAuthorized, (req, res) => {
    res.send(statsPage)
})


export default router

