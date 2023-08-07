import {Router} from 'express';
import {getRepository} from "typeorm";
import {AllTimeWinnersEntity} from "../database/entities/AllTimeWinnersEntity";
import {AllTimeStandingsEntity} from "../database/entities/AllTimeStandingsEntity";
import {WeeklyHighScoreEntity} from "../database/entities/WeeklyHighScoreEntity";
import {PlayerHighScoreEntity} from "../database/entities/PlayerHighScoreEntity";
import {YearlyFinishesEntity} from "../database/entities/YearlyFinishesEntity";
import {SleeperService} from "../services/SleeperService";
import {StatsMapper} from "../mappers/StatsMapper";
import {RedisCache} from "../cache/RedisClient";

const statsRouter = Router();
let statsMapper: StatsMapper;
const redisCache = new RedisCache();
const statsKey = "stats"; // A key to store stats in Redis

statsRouter.get('/stats', async (req, res) => {
    console.log("API Call received GET /stats")
    statsMapper = new StatsMapper(new SleeperService());
    const statsCache = await redisCache.getObject(statsKey, 'data');

    // If cache is available, return it immediately
    if (statsCache) {
        console.log("Cache HIT")
        return res.json(statsCache);
    }
    try {
        const allTimeWinnersRepository = getRepository(AllTimeWinnersEntity);
        const allTimeStandingsRepository = getRepository(AllTimeStandingsEntity);
        const weeklyHighScoresRepository = getRepository(WeeklyHighScoreEntity);
        const playerHighScoresRepository = getRepository(PlayerHighScoreEntity);
        const yearlyFinishesRepository = getRepository(YearlyFinishesEntity);

        const yearlyFinishesStats = await yearlyFinishesRepository.find();
        const allTimeWinnersStats = await allTimeWinnersRepository.find()
            .then(stats => statsMapper.mapAvatarAndRtpScore(stats))
        const allTimeStandingsStats = await allTimeStandingsRepository.find()
            .then(stats => statsMapper.mapAvatarOnly(stats))
        const weeklyHighScoresStats = await weeklyHighScoresRepository.find()
            .then(stats => statsMapper.mapAvatarOnly(stats))
        const playerHighScoresStats = await playerHighScoresRepository.find()
            .then(stats => statsMapper.mapAvatarOnly(stats))

        const statsResponse = {
            statProps: {
                allTimeWinners: {stats: allTimeWinnersStats},
                allTimeStandings: {stats: allTimeStandingsStats},
                weeklyHighScores: {stats: weeklyHighScoresStats},
                playerHighScores: {stats: playerHighScoresStats},
                yearlyFinishes: {stats: yearlyFinishesStats},
            }
        };

        const result = await statsResponse;
        await redisCache.putObject(statsKey, result, 86400, 'data');

        res.json(result);
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch data'});
    }
});

export default statsRouter;