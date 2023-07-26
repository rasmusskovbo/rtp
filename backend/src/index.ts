import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import {connectToDb} from "./config/db";
import statsRouter from "./routes/Stats";

const app = express();

dotenv.config();

connectToDb().then(() => {

    app.use('/api', statsRouter);
    //app.use('/api', uploadRouter);

}).catch(error => console.log(error));

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

