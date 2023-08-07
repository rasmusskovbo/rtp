import express, { Request, Response } from 'express';
import TeamsService, {TeamData} from '../services/TeamsService';

const router = express.Router();

router.get('/teams', async (req: Request, res: Response) => {
    try {
        console.log("Received request for /teams.")
        const teams: TeamData[] = await TeamsService.getAllTeams();
        res.json(teams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while retrieving teams' });
    }
});

export default router;
