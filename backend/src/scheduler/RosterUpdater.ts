import * as cron from 'node-cron';
import { SleeperService } from "../services/SleeperService";

const sleeperService = new SleeperService();

cron.schedule('0 7 * * *', async () => {
    console.log('Running daily roster update...');

    try {
        await sleeperService.fetchAndUpsertRostersJob();
        console.log('Rosters updated successfully.');
    } catch (err) {
        console.error('An error occurred while updating rosters:', err);
    }
});

console.log('Cron job for daily roster update scheduled.');
