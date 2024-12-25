import cron from "node-cron";
import { getRepository } from "typeorm";
import { CurrentWeekEntity } from "../database/entities/CurrentWeekEntity";
import { DateTime } from "luxon";

// Cron expression for 01:00 AM every Friday Copenhagen time
//const cronExpression = '0 1 * * 5';
const cronExpression = '30 18 * * 3'; // temp
const timeZone = 'Europe/Copenhagen';

// Schedule the cron job
cron.schedule(cronExpression, async () => {
    const now = DateTime.now().setZone(timeZone).toFormat('yyyy-MM-dd HH:mm:ss ZZZZ');
    console.log(`Starting vote lockout job at ${now}...`);

    try {
        // Get the repository for the NFLWeek entity
        const nflWeekRepository = getRepository(CurrentWeekEntity);

        // Find the current NFL week
        const currentWeekEntity = await nflWeekRepository.find();

        if (currentWeekEntity.length > 0) {
            currentWeekEntity[0].voteLockedOut = true;
            await nflWeekRepository.save(currentWeekEntity[0]);

            console.log("Successfully locked out voting.");
        } else {
            console.warn("No current week entity found to lock out voting.");
        }
    } catch (error) {
        console.error("Error during the vote lockout job:", error.message);
    }
}, {
    scheduled: true,
    timezone: timeZone,
});

console.log(`Cron job for weekly vote lockout scheduled for ${timeZone} at 01:00 AM every Friday.`);