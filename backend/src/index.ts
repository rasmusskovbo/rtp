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
//import  "./scheduler/LeaderboardUpdater";
//import  "./scheduler/MatchupUpdater";
import  "./scheduler/VoteLockoutUpdater";
import matchupsRoute from "./routes/MatchupsRoute";
import picksRoute from "./routes/PicksRoute";
import devRoute from "./routes/DevRoute";

const app = express();

dotenv.config();

connectToDb().then(() => {

    app.use(cors({
        origin: process.env.CORS_ORIGIN
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

}).catch(error => console.log(error));

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

