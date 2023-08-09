import cron from 'node-cron';
import { fetchAndMapMatchupsForWeek } from '../services/MatchupsService'
import {getRepository} from "typeorm";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";

// Cron expression to run the job every Wednesday at a specific time (e.g., 00:00)
const cronExpression = '0 0 * * 3';

// Schedule the cron job
const scheduledJob = cron.schedule(cronExpression, async () => {

    // Get the repository for the NFLWeek entity
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    // Find the current NFL week
    const currentWeek = await nflWeekRepository.find()

    await fetchAndMapMatchupsForWeek(currentWeek[0].weekNumber);

    // Increase the NFL week number for the next call
    if (currentWeek[0].weekNumber < 18) {
        currentWeek[0].weekNumber++;
        await nflWeekRepository.save(currentWeek);
    }

});

console.log('Cron job for matchups update scheduled.');
