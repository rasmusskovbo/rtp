// TODO

/// Init ////
import express from "express"
import session from "express-session"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import * as msgRepo from "./database/repository/messageRepository.js"

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000
})
const authRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 10000
})

app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "font-src": [
                "'self'", 
                "https://*.fontawesome.com", 
                "https://fonts.googLeapis.com/",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/"
            ],
            "default-src": [
                "'self'",
                "https://sleeper.app",
                "https://*.fontawesome.com"],
            "connect-src": [
                "'self'",
                "*", 
                "https://*.fontawesome.com"],
            "img-src": [
                "'self'",
                "data",
                "https://sleepercdn.com", 
                "https://*.fontawesome.com"],
            "script-src": [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.datatables.net/1.11.3/js/jquery.dataTables.min.js",
                "https://cdn.datatables.net/1.11.3/js/dataTables.bootstrap4.min.js",
                "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js",
                "https://*.fontawesome.com",
                "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js",
                "https://cdn.jsdelivr.net/npm/"
            ],
            "style-src": [
                "'self'",
                "'unsafe-inline'",
                "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css", 
                "https://fonts.googleapis.com/",
                "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css",
                "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css",
            ],
        }
    })
)

app.use("/auth", authRateLimiter)
app.use(rateLimiter)
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    isLoggedIn: false
  }))

/// Route import ///
import navigationRouter from './router/navigationRouter.js'
import registerRouter from './router/registerRouter.js'
import loginRouter from './router/loginRouter.js'
import sessionController from './util/session.js'
import profileRouter from './router/profileRouter.js'
import dashboardRouter from './router/dashboardRouter.js'
import boardRouter from './router/boardRouter.js'
import statsRouter from './router/statsRouter.js'

app.use(navigationRouter)
app.use(registerRouter)
app.use(loginRouter)
app.use(sessionController)
app.use(profileRouter)
app.use(boardRouter)
app.use(dashboardRouter)
app.use(statsRouter)

// Socket.io
io.on("connection", (socket) => {
    console.log("A user connected: {id: ", socket.id, "}")
})

// relay
io.on('connection', (socket) => {
    socket.on('chat message', async (msg) => {
        const formattedMsg = await msgRepo.insertMessage(msg)
        io.emit('chat message', formattedMsg)
    })
})

/// PORT setup ///
const PORT = process.env.PORT || 3000

server.listen(PORT, (error) => {
    if (error) {
        console.log(error)
    }
    console.log("Server is running on port", server.address().port)
})