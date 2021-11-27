import express from "express";
const router = express.Router();
import { createPage } from '../util/render.js'

/// Ready HTML pages using createPage js ///
const frontpagePage = createPage("frontpage/frontpage.html", {
    title: "Road To Pink | The League of Would-be Champions"
})

const loginPage = createPage("login/login.html", {
    title: "Road To Pink | Login"
})

const registerPage = createPage("register/register.html", {
    title: "Road To Pink | Register"
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


export default router

