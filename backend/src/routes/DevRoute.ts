import express, {Request, Response} from "express";
import {processVotesForMatchupsForWeek, updateWinnersForMatchups} from "../services/PicksService";
import {upsertAndMapMatchupsForWeek} from "../services/MatchupsService";
import {getRepository} from "typeorm";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";
import {SleeperService} from "../services/SleeperService";
import {fetchAndSavePostMatchupArticle, fetchAndSavePreMatchupArticle} from "../services/OpenAPIService";

const router = express.Router();

router.get("/article/prematchup", async (req: Request, res: Response) => {
    const data = await fetchAndSavePreMatchupArticle();

    res.status(200).send(data);
})

router.get("/article/recap", async (req: Request, res: Response) => {
    const data = await fetchAndSavePostMatchupArticle();

    res.status(200).send(data);
})

// Setup/update rosters
router.get('/updaterosters', async (req: Request, res: Response) => {
    const sleeperService = new SleeperService();

    await sleeperService.fetchAndUpsertRostersJob();

    res.status(200).send();
});

// Setup sleeper matchups for current week
router.get('/updatematchups', async (req: Request, res: Response) => {
    const nflWeekRepository = getRepository(CurrentWeekEntity);
    const currentWeekEntity = await nflWeekRepository.find();
    const currentWeek = currentWeekEntity[0];

    await upsertAndMapMatchupsForWeek(currentWeek.weekNumber);

    res.status(200).send('Matchups updated successfully');
});

// Setup/update rosters
router.get('/updaterosters', async (req: Request, res: Response) => {
    const sleeperService = new SleeperService();

    await sleeperService.fetchAndUpsertRostersJob();

    res.status(200).send("Updated rosters successfully");
});

// Test vote lockout rosters
router.get('/lockoutvote', async (req: Request, res: Response) => {
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    const currentWeekEntity = await nflWeekRepository.find()
    currentWeekEntity[0].voteLockedOut = true;

    await nflWeekRepository.save(currentWeekEntity)

    res.status(200).send('Votes locked out successfully');
});

// Update leaderboards
router.get('/updateleaderboard', async (req: Request, res: Response) => {
    // Get the repository for the NFLWeek entity
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    // Find the current NFL week
    const currentWeekEntity = await nflWeekRepository.find()
    const currentWeek = currentWeekEntity[0].weekNumber;

    // Update winners for all matchup entities for given week
    await updateWinnersForMatchups(currentWeek);

    // Check all votes for each matchup ID. For each vote, for each matchup, mark it correct or incorrect
    await processVotesForMatchupsForWeek(currentWeek);

    res.status(200).send('Leaderboard updated successfully');
});




export default router;