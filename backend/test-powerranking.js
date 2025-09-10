const express = require('express');
const { PowerRankingService } = require('./dist/services/PowerRankingService');
const { AuthService } = require('./dist/services/AuthService');

const app = express();
app.use(express.json());

// Test the PowerRankingService directly
async function testPowerRanking() {
    try {
        console.log('Testing PowerRankingService...');
        
        // Test getCurrentRankings
        const rankings = await PowerRankingService.getCurrentRankings();
        console.log('Current rankings:', rankings.length, 'teams');
        
        // Test getAvailableWeeks
        const weeks = await PowerRankingService.getAvailableWeeks();
        console.log('Available weeks:', weeks);
        
        // Test AuthService
        const authService = new AuthService();
        const user = await authService.getUserByUsername('rasmus');
        console.log('User found:', user ? user.username : 'Not found');
        
        console.log('All tests passed!');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testPowerRanking();