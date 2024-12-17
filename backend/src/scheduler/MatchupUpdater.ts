import cron from 'node-cron';
import { upsertAndMapMatchupsForWeek } from '../services/MatchupsService';
import { getRepository } from "typeorm";
import { CurrentWeekEntity } from "../database/entities/CurrentWeekEntity";

// Import DateTime from Luxon
import { DateTime } from 'luxon';

// Cron expression to run the job at 10:30 AM Copenhagen Local Time
const cronExpression = '30 10 * * 3';
const timeZone = 'Europe/Copenhagen';

// Schedule the cron job with Luxon for timezone handling
cron.schedule(cronExpression, async () => {
    const now = DateTime.now().setZone(timeZone).toFormat('yyyy-MM-dd HH:mm:ss ZZZZ');
    console.log(`Starting matchup updating job at ${now}`);

    try {
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
            console.log("Successfully finished matchup updating job.");
        } else {
            console.log("Did not update week number - week 18 has been reached.");
        }
    } catch (error) {
        console.error("Error during the matchup updating job:", error.message);
    }
}, {
    scheduled: true,
    timezone: timeZone
});

console.log(`Cron job for weekly initial matchups update scheduled for ${timeZone}.`);