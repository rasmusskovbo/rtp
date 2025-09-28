import express, { Request, Response } from 'express';
import { PowerRankingService, UserRankingSubmission, TeamRankingData, WeeklyRankingData } from '../services/PowerRankingService';
import { PowerRankingTrophyService, TrophyData } from '../services/PowerRankingTrophyService';
import { AuthService } from '../services/AuthService';

// Request interfaces
export interface SubmitRankingsRequest {
    rankings: UserRankingSubmission[];
    username: string;
}

export interface GetUserRankingsRequest {
    username: string;
}

// Response interfaces
export interface SubmitRankingsResponse {
    message: string;
}

export interface GetRankingsResponse {
    rankings: TeamRankingData[];
}

export interface GetWeeklyRankingsResponse {
    rankings: TeamRankingData[];
}

export interface GetAvailableWeeksResponse {
    weeks: number[];
}

export interface GetCurrentWeekResponse {
    currentWeek: number;
}

export interface GetUserRankingsResponse {
    userRankings: UserRankingSubmission[];
}

export interface GetTrophiesResponse {
    trophies: TrophyData[];
}

export interface GetCommentsResponse {
    comments: Array<{
        id: number;
        comment: string;
        rank: number;
        team: {
            id: number;
            teamName: string;
            ownerName: string;
            teamLogo: string;
        };
        user: {
            id: string;
            name: string;
        };
    }>;
}

export interface ErrorResponse {
    error: string;
}

const router = express.Router();

// GET /api/power-rankings - Get current power rankings
router.get('/power-rankings', async (req: Request, res: Response<GetRankingsResponse | ErrorResponse>) => {
    try {
        console.log("Received request for /power-rankings");
        const rankings = await PowerRankingService.getCurrentRankings();
        const response: GetRankingsResponse = { rankings };
        res.json(response);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = { error: 'An error occurred while retrieving power rankings' };
        res.status(500).json(errorResponse);
    }
});

// GET /api/power-rankings/week - Get rankings for the current week (from DB)
router.get('/power-rankings/week', async (req: Request, res: Response<GetWeeklyRankingsResponse | ErrorResponse>) => {
    try {
        console.log(`Received request for /power-rankings/week (current)`);
        const rankings = await PowerRankingService.getRankingsForCurrentWeek();
        const response: GetWeeklyRankingsResponse = { rankings };
        res.json(response);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = { error: 'An error occurred while retrieving power rankings for the week' };
        res.status(500).json(errorResponse);
    }
});

// GET /api/power-rankings/week/:week - Get rankings for a specific week
router.get('/power-rankings/week/:week', async (req: Request, res: Response<GetWeeklyRankingsResponse | ErrorResponse>) => {
    try {
        const weekParam = req.params.week;
        const week = parseInt(weekParam, 10);
        if (Number.isNaN(week) || week < 1 || week > 17) {
            const errorResponse: ErrorResponse = { error: 'Week must be an integer between 1 and 17' };
            res.status(400).json(errorResponse);
            return;
        }

        console.log(`Received request for /power-rankings/week/${week}`);
        const rankings = await PowerRankingService.getRankingsForWeek(week);
        const response: GetWeeklyRankingsResponse = { rankings };
        res.json(response);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = { error: 'An error occurred while retrieving power rankings for the week' };
        res.status(500).json(errorResponse);
    }
});

// GET /api/power-rankings/weeks - Get all available weeks
router.get('/power-rankings/weeks', async (req: Request, res: Response<GetAvailableWeeksResponse | ErrorResponse>) => {
    try {
        console.log("Received request for /power-rankings/weeks");
        const weeks = await PowerRankingService.getAvailableWeeks();
        const response: GetAvailableWeeksResponse = { weeks };
        res.json(response);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = { error: 'An error occurred while retrieving available weeks' };
        res.status(500).json(errorResponse);
    }
});

// GET /api/power-rankings/current-week - Get current week number
router.get('/power-rankings/current-week', async (req: Request, res: Response<GetCurrentWeekResponse | ErrorResponse>) => {
    try {
        console.log("Received request for /power-rankings/current-week");
        const currentWeek = await PowerRankingService.getCurrentWeekNumber();
        const response: GetCurrentWeekResponse = { currentWeek };
        res.json(response);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = { error: 'An error occurred while retrieving current week' };
        res.status(500).json(errorResponse);
    }
});

// POST /api/power-rankings/submit - Submit rankings for the current week
router.post('/power-rankings/submit', async (req: Request<{}, SubmitRankingsResponse | ErrorResponse, SubmitRankingsRequest>, res: Response<SubmitRankingsResponse | ErrorResponse>) => {
    try {
        const request: SubmitRankingsRequest = req.body;
        const { rankings, username } = request;

        if (!rankings || !Array.isArray(rankings) || !username) {
            const errorResponse: ErrorResponse = { error: 'Rankings array and username are required' };
            res.status(400).json(errorResponse);
            return;
        }

        // Validate rankings structure
        for (const ranking of rankings) {
            if (!ranking.teamId || !ranking.rank) {
                const errorResponse: ErrorResponse = { error: 'Each ranking must have teamId and rank' };
                res.status(400).json(errorResponse);
                return;
            }
            if (ranking.rank < 1 || ranking.rank > 12) {
                const errorResponse: ErrorResponse = { error: 'Rank must be between 1 and 12' };
                res.status(400).json(errorResponse);
                return;
            }
            if (ranking.comment && ranking.comment.length > 300) {
                const errorResponse: ErrorResponse = { error: 'Comments must be 300 characters or less' };
                res.status(400).json(errorResponse);
                return;
            }
        }

        // Get user ID from username
        const authService = new AuthService();
        const user = await authService.getUserByUsername(username);
        
        if (!user) {
            const errorResponse: ErrorResponse = { error: 'Invalid username' };
            res.status(400).json(errorResponse);
            return;
        }

        console.log(`User ${username} submitting rankings for current week (from DB)`);
        
        await PowerRankingService.submitRankings(
            user.id,
            rankings as UserRankingSubmission[]
        );

        const successResponse: SubmitRankingsResponse = { message: 'Rankings submitted successfully' };
        res.json(successResponse);
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            const errorResponse: ErrorResponse = { error: err.message };
            res.status(400).json(errorResponse);
        } else {
            const errorResponse: ErrorResponse = { error: 'An error occurred while submitting rankings' };
            res.status(500).json(errorResponse);
        }
    }
});

// GET /api/power-rankings/user - Get user's rankings for the current week
router.get('/power-rankings/user', async (req: Request<{}, GetUserRankingsResponse | ErrorResponse, {}, { username: string }>, res: Response<GetUserRankingsResponse | ErrorResponse>) => {
    try {
        const { username } = req.query;
        
        if (!username || typeof username !== 'string') {
            const errorResponse: ErrorResponse = { error: 'Username query parameter is required' };
            res.status(400).json(errorResponse);
            return;
        }

        // Get user ID from username
        const authService = new AuthService();
        const user = await authService.getUserByUsername(username);
        
        if (!user) {
            const errorResponse: ErrorResponse = { error: 'Invalid username' };
            res.status(400).json(errorResponse);
            return;
        }

        console.log(`User ${username} requesting their rankings for current week (from DB)`);
        
        const userRankings = await PowerRankingService.getUserRankingsForCurrentWeek(user.id);

        const response: GetUserRankingsResponse = { userRankings };
        res.json(response);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = { error: 'An error occurred while retrieving user rankings' };
        res.status(500).json(errorResponse);
    }
});

// GET /api/power-rankings/trophies - Get all trophy data
router.get('/power-rankings/trophies', async (req: Request, res: Response<GetTrophiesResponse | ErrorResponse>) => {
    try {
        console.log("Received request for /power-rankings/trophies");
        const trophies = await PowerRankingTrophyService.getAllTrophies();
        const response: GetTrophiesResponse = { trophies };
        res.json(response);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = { error: 'An error occurred while retrieving trophy data' };
        res.status(500).json(errorResponse);
    }
});

// GET /api/power-rankings/comments - Get all comments from current week
router.get('/power-rankings/comments', async (req: Request, res: Response<GetCommentsResponse | ErrorResponse>) => {
    try {
        console.log("Received request for /power-rankings/comments");
        const comments = await PowerRankingService.getCurrentWeekComments();
        const response: GetCommentsResponse = { 
            comments: comments.map(c => ({
                id: c.id,
                comment: c.comment!,
                rank: c.rank,
                team: {
                    id: c.team.id,
                    teamName: c.team.teamName,
                    ownerName: c.team.ownerName,
                    teamLogo: c.team.teamLogo
                },
                user: {
                    id: c.user.id,
                    name: c.user.username
                }
            }))
        };
        res.json(response);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = { error: 'An error occurred while retrieving comments' };
        res.status(500).json(errorResponse);
    }
});

export default router;