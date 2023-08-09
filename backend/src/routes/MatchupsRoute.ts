import express, {Request, Response} from "express";
import {getMatchupsForCurrentWeek} from "../services/MatchupsService";

const router = express.Router();

router.get('/matchups', async (req: Request, res: Response) => {
    const matchups = await getMatchupsForCurrentWeek()
    res.json(matchups);
});

export default router;