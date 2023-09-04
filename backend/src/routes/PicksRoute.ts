import express, {Request, Response} from "express";
import {getPicksLeaderboard, getPicksStatistics} from "../services/PicksService";

const router = express.Router();

router.get('/picks/leaderboard', async (req: Request, res: Response) => {
    const leaderboard = await getPicksLeaderboard()
    res.json(leaderboard);
});

router.get('/picks/stats', async (req: Request, res: Response) => {
    const stats = await getPicksStatistics();
    res.json(stats);
});

// TODO Week by week results -> Drop down filter and show end of week results -> total votes on each team, and which team won with score
// Advanced stats -> Who was the most voted for (fan favourite), least voted for (destined for pink), who had the most upset wins (underdog), who had the most losses while favored (bravado man)
export default router;