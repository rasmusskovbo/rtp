import {Router} from 'express';
import {getRepository} from "typeorm";
import {AllTimeWinnersEntity} from "../database/entities/AllTimeWinnersEntity";
import {AllTimeStandingsEntity} from "../database/entities/AllTimeStandingsEntity";
import {WeeklyHighScoreEntity} from "../database/entities/WeeklyHighScoreEntity";
import {PlayerHighScoreEntity} from "../database/entities/PlayerHighScoreEntity";
import {YearlyFinishesEntity} from "../database/entities/YearlyFinishesEntity";
import {getSleeperAvatarUrlBySleeperUsername} from "../services/sleeperService";
import {ISleeperUser} from "../database/entities/ISleeperUser";

const statsRouter = Router();

statsRouter.get('/stats', async (req, res) => {
    try {
        const allTimeWinnersRepository = getRepository(AllTimeWinnersEntity);
        const allTimeStandingsRepository = getRepository(AllTimeStandingsEntity);
        const weeklyHighScoresRepository = getRepository(WeeklyHighScoreEntity);
        const playerHighScoresRepository = getRepository(PlayerHighScoreEntity);
        const yearlyFinishesRepository = getRepository(YearlyFinishesEntity);

        let allTimeWinnersStats = await allTimeWinnersRepository.find();
        let allTimeStandingsStats = await allTimeStandingsRepository.find();
        let weeklyHighScoresStats = await weeklyHighScoresRepository.find();
        let playerHighScoresStats = await playerHighScoresRepository.find();
        const yearlyFinishesStats = await yearlyFinishesRepository.find();

        allTimeWinnersStats = await Promise.all(allTimeWinnersStats.map(async (item) => {
            const rtpScore = calculateRtpScore(item);
            const avatar = await getSleeperAvatar(item);
            return { ...item, rtpScore, avatar };
        }));

        allTimeStandingsStats = await Promise.all(allTimeStandingsStats.map(async (item) => {
            const avatar = await getSleeperAvatar(item);
            return { ...item, avatar };
        }))

        weeklyHighScoresStats = await Promise.all(weeklyHighScoresStats.map(async (item) => {
            const avatar = await getSleeperAvatar(item);
            return { ...item, avatar };
        }))

        playerHighScoresStats = await Promise.all(playerHighScoresStats.map(async (item) => {
            const avatar = await getSleeperAvatar(item);
            return { ...item, avatar };
        }))

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

function calculateRtpScore(statLine: AllTimeWinnersEntity): number {
    const positiveRtpScore =
        statLine.wins * 40 +
        statLine.second_place * 20 +
        statLine.third_place * 10 +
        statLine.playoff_appearances * 5;

    const negativeRtpScore =
        statLine.pinks * 40 +
        statLine.toilet_wins * 20

    return positiveRtpScore - negativeRtpScore;
}

async function getSleeperAvatar(statLine: ISleeperUser): Promise<String> {
    return await getSleeperAvatarUrlBySleeperUsername(statLine.sleeper_username)
}
