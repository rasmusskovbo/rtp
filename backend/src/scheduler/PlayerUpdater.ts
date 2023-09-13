import * as cron from 'node-cron';
import { SleeperService } from "../services/SleeperService";

const sleeperService = new SleeperService();

// Define the cron job for updating players (every day at 06:00 UTC)
cron.schedule('0 6 * * *', async () => {
    console.log('Running daily player update...');

    try {
        await sleeperService.updatePlayersJob();
        console.log('Players updated successfully');
    } catch (err) {
        console.error('An error occurred while updating players:', err);
    }
});

console.log('Cron job for daily player update scheduled');
