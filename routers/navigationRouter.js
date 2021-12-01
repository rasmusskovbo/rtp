import express from "express";
import { createPage } from '../util/render.js'

const router = express.Router();

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

const leagueBoardPage = createPage("leagueBoard/leagueBoard.html", {
    title: "League Board | Road To Pink"
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

// todo authorize access to league board
router.get("/league-board", (req, res) => {
    res.send(leagueBoardPage)
})

function isAuthorized(req, res, next) {
    if (!req.session.isLoggedIn) {
        res.redirect("/login")
    }
    next()
}


export default router

