const express = require('express');
const router = express.Router();
const { parseLeaderboardData, calculateWeeklyRanks } = require('./leaderboard-parser');

router.get('/', (req, res) => {
    // Determine the base URL based on the request path
    const baseUrl = req.baseUrl.includes('/random') ? '/random' : '';
    res.render('ranks', { baseUrl, results: null });
});

router.post('/calculate', express.text(), (req, res) => {
    try {
        const leaderboardText = req.body;
        const timestamp = new Date().toISOString();
        
        // Log the incoming request
        console.log(`\n[${timestamp}] POST /ranks/calculate - REQUEST`);
        console.log(`Text length: ${leaderboardText ? leaderboardText.length : 0} chars`);
        
        // Log first 500 chars of input for debugging
        if (leaderboardText) {
            console.log('Input preview:');
            console.log('---START OF INPUT---');
            console.log(leaderboardText.substring(0, 500) + (leaderboardText.length > 500 ? '...' : ''));
            console.log('---END OF INPUT---');
        }
        
        if (!leaderboardText || leaderboardText.trim() === '') {
            const errorResponse = { error: 'No leaderboard data provided' };
            console.log(`[${timestamp}] RESPONSE: 400 Bad Request`);
            console.log('Response:', JSON.stringify(errorResponse));
            return res.status(400).json(errorResponse);
        }
        
        // Parse the leaderboard data
        const days = parseLeaderboardData(leaderboardText);
        console.log(`Parsed ${days.length} days of data`);
        days.forEach((day, i) => {
            console.log(`  Day ${i+1}: ${day.game} (${day.date}) - ${day.players.length} players`);
        });
        
        // Calculate weekly ranks
        const weeklyRanks = calculateWeeklyRanks(days);
        console.log(`Calculated weekly ranks for ${weeklyRanks.length} players`);
        
        console.log('Output:');
        weeklyRanks.forEach((player, i) => {
            console.log(`  ${i+1}. ${player.name}: ${player.totalRank} points`);
        });
        
        const response = {
            success: true,
            weeklyRanks,
            daysProcessed: days.length,
            totalPlayers: weeklyRanks.length
        };
        
        console.log(`[${timestamp}] RESPONSE: 200 OK`);
        console.log(`Response summary: ${response.daysProcessed} days processed, ${response.totalPlayers} players ranked`);
        
        res.json(response);
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR in /ranks/calculate:`, error);
        console.error('Stack trace:', error.stack);
        
        const errorResponse = { 
            success: false, 
            error: 'Failed to calculate ranks: ' + error.message 
        };
        
        console.log(`[${timestamp}] RESPONSE: 500 Internal Server Error`);
        console.log('Response:', JSON.stringify(errorResponse));
        
        res.status(500).json(errorResponse);
    }
});

module.exports = router;