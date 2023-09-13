import cron from 'node-cron';
import { upsertAndMapMatchupsForWeek } from '../services/MatchupsService'
import {getRepository} from "typeorm";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";

// Cron expression to run the job every Wednesday at 05:00 UTC
const cronExpression = '0 5 * * 3';

// Schedule the cron job
cron.schedule(cronExpression, async () => {
    console.log("Starting matchup updating job...")
    // Get the repository for the NFLWeek entity
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    // Find the current NFL week
    const currentWeekEntity = await nflWeekRepository.find();
    const currentWeek = currentWeekEntity[0];

    // Increase the NFL week number
    if (currentWeek.weekNumber < 18) {
        currentWeek.weekNumber++;
        currentWeek.voteLockedOut = false;
        await nflWeekRepository.save(currentWeek);

        await upsertAndMapMatchupsForWeek(currentWeek.weekNumber);
        console.log("Successfully finished matchup updating job.")
    } else {
        console.log("Did not update week number - week 18 has been reached.")
    }

});

console.log('Cron job for weekly initial matchups update scheduled.');
