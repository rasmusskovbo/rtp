import express, {Request, Response} from "express";
import {getPicksLeaderboard} from "../services/PicksService";

const router = express.Router();

router.get('/picks', async (req: Request, res: Response) => {
    const leaderboard = await getPicksLeaderboard()
    res.json(leaderboard);
});

export default router;