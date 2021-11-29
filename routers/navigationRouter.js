import express from "express";
const router = express.Router();
import { createPage } from '../util/render.js'

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

router.get("/profile", (req, res) => {
    if (req.session.isLoggedIn) {
        res.send(profilePage)
    } else {
        res.redirect("/login")
    }
})


export default router

