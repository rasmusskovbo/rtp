import cron from 'node-cron';
import { upsertAndMapMatchupsForWeek } from '../services/MatchupsService'
import {getRepository} from "typeorm";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";

// Cron expression to run the job every Wednesday at a specific time (e.g., 00:00)
const cronExpression = '0 9 * * 3';

// Schedule the cron job
cron.schedule(cronExpression, async () => {
    console.log("Starting matchup updating job...")
    // Get the repository for the NFLWeek entity
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    // Find the current NFL week
    const currentWeekEntity = await nflWeekRepository.find();
    const currentWeek = currentWeekEntity[0];

    await upsertAndMapMatchupsForWeek(currentWeek.weekNumber);

    // Increase the NFL week number for the next call
    if (currentWeek.weekNumber < 18) {
        currentWeek.weekNumber++;
        currentWeek.voteLockedOut = false;
        await nflWeekRepository.save(currentWeek);
        console.log("Successfully finished matchup updating job.")
    } else {
        console.log("Did not update week number - week 18 has been reached.")
    }
});

console.log('Cron job for weekly initial matchups update scheduled.');
