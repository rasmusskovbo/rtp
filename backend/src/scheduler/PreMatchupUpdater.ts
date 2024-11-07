// Runs 1 hour after MatchupUpdater
import cron from "node-cron";
import {fetchAndSavePreMatchupArticle} from "../services/OpenAPIService";

// Cron expression to run the job every Thursday at 06:00 UTC
const cronExpression = '0 7 * * 4';

// Schedule the cron job
cron.schedule(cronExpression, async () => {
    console.log("Starting fetch and save prematchup article job...")

    await fetchAndSavePreMatchupArticle()

    console.log("Successfully fetched and saved article.")
});

console.log('Cron job for weekly prematchup article scheduled.');