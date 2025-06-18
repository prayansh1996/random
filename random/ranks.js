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
        
        if (!leaderboardText || leaderboardText.trim() === '') {
            return res.status(400).json({ error: 'No leaderboard data provided' });
        }
        
        // Parse the leaderboard data
        const days = parseLeaderboardData(leaderboardText);
        
        // Calculate weekly ranks
        const weeklyRanks = calculateWeeklyRanks(days);
        
        res.json({
            success: true,
            weeklyRanks,
            daysProcessed: days.length,
            totalPlayers: weeklyRanks.length
        });
    } catch (error) {
        console.error('Error calculating ranks:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to calculate ranks: ' + error.message 
        });
    }
});

module.exports = router;