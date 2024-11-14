// Runs 1 hour after MatchupUpdater
import cron from "node-cron";
import {fetchAndSavePostMatchupArticle, fetchAndSavePreMatchupArticle} from "../services/OpenAPIService";

// Cron expression to run the job every Tuesday at 06:00 UTC
const cronExpression = '0 7 * * 2';

// Schedule the cron job
cron.schedule(cronExpression, async () => {
    console.log("Starting fetch and save recap article job...")

    await fetchAndSavePostMatchupArticle()

    console.log("Successfully fetched and saved recap article.")
});

console.log('Cron job for weekly prematchup article scheduled.');