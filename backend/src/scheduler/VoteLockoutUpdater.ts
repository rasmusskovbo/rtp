// Runs 1 hour before MatchupUpdater
import cron from "node-cron";
import {getRepository} from "typeorm";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";

// Every Thursday at 21:00 UTC
const cronExpression = '0 21 * * 4';

// Schedule the cron job
cron.schedule(cronExpression, async () => {
    console.log("Starting vote lockout job...")

    // Get the repository for the NFLWeek entity
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    // Find the current NFL week
    const currentWeekEntity = await nflWeekRepository.find()
    currentWeekEntity[0].voteLockedOut = true;

    await nflWeekRepository.save(currentWeekEntity)

    console.log("Successfully locked out voting.")
});

console.log('Cron job for weekly vote lockedout scheduled.');