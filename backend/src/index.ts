import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import {connectToDb} from "./config/db";
import statsRouter from "./routes/StatsRoute";
import uploadRouter from "./routes/UploadRoute";
import cors from 'cors';
import loginRouter from "./routes/LoginRoute";
import postsRoute from "./routes/PostsRoute";

const app = express();

dotenv.config();

connectToDb().then(() => {

    app.use(cors({
    }));
    app.use(express.json());

    app.use('/api', statsRouter);
    app.use('/api', uploadRouter);
    app.use('/api', postsRoute);
    app.use('/auth', loginRouter);

}).catch(error => console.log(error));

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

