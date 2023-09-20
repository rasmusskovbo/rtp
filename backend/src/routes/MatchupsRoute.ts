import express, {Request, Response} from "express";
import {
    castVoteForMatchup,
    getUserVote, upsertAndMapMatchupsForWeek,
    getMatchupsForCurrentWeek,
    UserVoteRequest, getMatchupsForWeek, getUserVotesByUsernameAndWeek, parseUsername
} from "../services/MatchupsService";
import {getVoteLockoutDetails, getVoteLockoutDetailsForWeek} from "../services/PicksService";

const router = express.Router();

router.get('/matchups', async (req: Request, res: Response) => {
    const matchups = await getMatchupsForCurrentWeek()
    res.json(matchups);
});

router.post('/matchups', async (req: Request, res: Response) => {
    const weekNumber = parseInt(req.body.weekNumber, 10);

    if (isNaN(weekNumber) || weekNumber < 1) {
        return res.status(400).json({ error: 'Invalid week number' });
    }

    try {
        const matchups = await getMatchupsForWeek(weekNumber);
        res.json(matchups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch matchups' });
    }
});

// Endpoint to check if the user has already voted for a specific matchup
router.post('/matchups/vote/poll', async (req: Request, res: Response) => {
    const request: UserVoteRequest = {
        userAsString: req.body.userAsString,
        matchupId: req.body.matchupId,
    };

    try {
        const userHasVoted = await getUserVote(request);
        res.json( userHasVoted );
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
            res.status(400).json({ message: "User already voted or vote is locked out!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong. Try again later." });
    }
});

router.get('/matchups/votes', async (req: Request, res: Response) => {
    const username = parseUsername(req.query.username as string);
    const week = parseInt(req.query.week as string, 10);

    if (!username || isNaN(week) || week < 1) {
        return res.status(400).json({ error: 'Invalid username or week' });
    }

    try {
        const userVotes = await getUserVotesByUsernameAndWeek(username, week);
        res.json(userVotes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user votes' });
    }
});

router.get('/matchups/lockout', async (req: Request, res: Response) => {
    const voteLockoutDetails = await getVoteLockoutDetails();
    res.json(voteLockoutDetails);
})

router.get('/matchups/lockout/:week', async (req: Request, res: Response) => {
    const week = parseInt(req.params.week as string, 10);

    if (isNaN(week) || week < 1) {
        return res.status(400).json({ error: 'Invalid week' });
    }

    const voteLockoutDetails = await getVoteLockoutDetailsForWeek(week);
    res.json(voteLockoutDetails);
})

export default router;