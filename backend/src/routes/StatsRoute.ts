import {Router} from 'express';
import {getRepository} from "typeorm";
import {AllTimeWinnersEntity} from "../database/entities/AllTimeWinnersEntity";
import {AllTimeStandingsEntity} from "../database/entities/AllTimeStandingsEntity";
import {WeeklyHighScoreEntity} from "../database/entities/WeeklyHighScoreEntity";
import {PlayerHighScoreEntity} from "../database/entities/PlayerHighScoreEntity";
import {YearlyFinishesEntity} from "../database/entities/YearlyFinishesEntity";
import {SleeperService} from "../services/SleeperService";
import {StatsMapper} from "../mappers/StatsMapper";

const statsRouter = Router();
let statsMapper: StatsMapper

statsRouter.get('/stats', async (req, res) => {
    console.log("API Call received GET /stats")
    statsMapper = new StatsMapper(new SleeperService())

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

        res.json({
            statProps: {
                allTimeWinners: {stats: allTimeWinnersStats},
                allTimeStandings: {stats: allTimeStandingsStats},
                weeklyHighScores: {stats: weeklyHighScoresStats},
                playerHighScores: {stats: playerHighScoresStats},
                yearlyFinishes: {stats: yearlyFinishesStats},
            }
        });
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch data'});
    }
});

export default statsRouter;