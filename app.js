/// Init ////
import express from "express";
import session from "express-session";
const app = express();

app.use(session({secret: 'shh'}));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/// Route import ///
import navigationRouter from './routers/navigationRouter.js'
import registerRouter from './routers/registerRouter.js'
import loginRouter from './routers/loginRouter.js'

app.use(navigationRouter)
app.use(registerRouter)
app.use(loginRouter)


/// PORT setup ///
const PORT = process.env.PORT || 3000

const server = app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    }
    console.log("Server is running on port", server.address().port);
});