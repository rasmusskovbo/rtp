import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import {connectToDb} from "./config/db";
import statsRouter from "./routes/stats";

const app = express();
dotenv.config()

connectToDb().then(async connection => {
    app.use('/api', statsRouter);
}).catch(error => console.log(error));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

