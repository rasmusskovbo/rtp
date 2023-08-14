import express, {Request, Response} from "express";
import {
    castVoteForMatchup,
    checkIfUserHasVoted, upsertAndMapMatchupsForWeek,
    getMatchupsForCurrentWeek,
    UserVoteRequest
} from "../services/MatchupsService";

const router = express.Router();

router.get('/matchups', async (req: Request, res: Response) => {
    const matchups = await getMatchupsForCurrentWeek()
    res.json(matchups);
});

// Endpoint to check if the user has already voted for a specific matchup
router.post('/matchups/vote/poll', async (req: Request, res: Response) => {
    const request: UserVoteRequest = {
        userAsString: req.body.userAsString,
        matchupId: req.body.matchupId,
    };

    try {
        const userHasVoted = await checkIfUserHasVoted(request);
        res.json({ userHasVoted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to fetch voting data from API." });
    }
});

router.post('/matchups/vote', async (req: Request, res: Response) => {
    const userVoteRequest: UserVoteRequest = {
        userAsString: req.body.userAsString,
        matchupId: req.body.matchupId,
        rosterId: req.body.rosterId,
    };

    try {
        const success = await castVoteForMatchup(userVoteRequest);
        if (success) {
            res.status(200).json({ message: "Vote submitted!" });
        } else {
            res.status(400).json({ message: "User already voted!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong. Try again later." });
    }
});



export default router;