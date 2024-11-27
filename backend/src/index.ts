import dotenv from 'dotenv';
import express from 'express';
import {connectToDb} from "./config/db";
import statsRouter from "./routes/StatsRoute";
import uploadRouter from "./routes/UploadRoute";
import cors from 'cors';
import loginRouter from "./routes/LoginRoute";
import postsRoute from "./routes/PostsRoute";
import teamsRoute from "./routes/TeamsRoute";
import  "./scheduler/RosterUpdater";
import  "./scheduler/PlayerUpdater";
import  "./scheduler/LeaderboardUpdater";
import  "./scheduler/MatchupUpdater";
import  "./scheduler/VoteLockoutUpdater";
import  "./scheduler/PreMatchupUpdater"
//import  "./scheduler/RecapArticleUpdater"
import matchupsRoute from "./routes/MatchupsRoute";
import picksRoute from "./routes/PicksRoute";
import devRoute from "./routes/DevRoute";
import videoProxyRoute from "./routes/VideoProxyRoute";
import * as process from "process";

const app = express();

dotenv.config();

connectToDb().then(() => {

    const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

    app.use(cors({
        origin: function(origin, callback) {
            if(!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) === -1) {
                console.log(allowedOrigins)
                console.log(origin)
                let msg = `The CORS policy for this site does not allow access from the specified Origin.`;
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        }
    }));

    app.use(express.json());

    app.use('/api', statsRouter);
    app.use('/api', uploadRouter);
    app.use('/api', postsRoute);
    app.use('/api', teamsRoute);
    app.use('/api', matchupsRoute);
    app.use('/api', picksRoute);
    app.use('/auth', loginRouter);
    app.use('/dev', devRoute)
    app.use('/api', videoProxyRoute)

}).catch(error => console.log(error));

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

