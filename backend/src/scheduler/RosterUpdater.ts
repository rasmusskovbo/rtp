import * as cron from 'node-cron';
import {SleeperService} from "../services/SleeperService";

const sleeperService = new SleeperService();

// Define the cron job
cron.schedule('0 7 * * *', async () => {
    console.log('Running daily roster update...');

    sleeperService.fetchAndUpsertRosters()
    // Here you might iterate over all the ownerId values you need to update
    // You'll need to modify the fetchAndUpsertRosters function to support bulk updating if necessary
    try {
        await (ownerId); // Replace ownerId with the actual value or loop through them
        console.log('Rosters updated successfully');
    } catch (err) {
        console.error('An error occurred while updating rosters:', err);
    }
});

console.log('Cron job for daily roster update scheduled');
