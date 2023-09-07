import cron from 'node-cron';
import {getRepository} from "typeorm";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";
import {processVotesForMatchupsForWeek, updateWinnersForMatchups} from "../services/PicksService";

// Runs 1 hour before MatchupUpdater (Wednesday at 08:00 CET)
const cronExpression = '0 8 * * 3';

// Schedule the cron job
cron.schedule(cronExpression, async () => {

    // Get the repository for the NFLWeek entity
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    // Find the current NFL week
    const currentWeekEntity = await nflWeekRepository.find()
    const currentWeek = currentWeekEntity[0].weekNumber;

    // Update winners for all matchup entities for given week
    await updateWinnersForMatchups(currentWeek);

    // Check all votes for each matchup ID. For each vote, for each matchup, mark it correct or incorrect
    await processVotesForMatchupsForWeek(currentWeek);

});

console.log('Cron job for vote count scheduled.');
