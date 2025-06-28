const express = require('express');
const router = express.Router();
const { parseLeaderboardData, calculateWeeklyRanks } = require('./leaderboard-parser');
const { 
    storeRankings, 
    getAllRankings, 
    calculateWeeklyRankingsForRange,
    calculateMonthlyRankings,
    getGameKings
} = require('./rankings-storage');
const { getRecentWeeks, getRecentMonths } = require('./date-utils');

router.get('/', (req, res) => {
    // Determine the base URL based on the request path
    const baseUrl = req.baseUrl.includes('/random') ? '/random' : '';
    res.render('ranks', { baseUrl, results: null });
});

router.post('/calculate', express.text(), async (req, res) => {
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
        
        // Store the parsed data in the JSON file
        await storeRankings(days);
        console.log('Rankings stored successfully');
        
        // Calculate weekly ranks
        const weeklyRanks = calculateWeeklyRanks(days);
        console.log(`Calculated weekly ranks for ${weeklyRanks.length} players`);
        
        // Log top 5 players
        console.log('Players:');
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

// Get all stored rankings
router.get('/data', async (req, res) => {
    try {
        const rankings = await getAllRankings();
        res.json({
            success: true,
            data: rankings
        });
    } catch (error) {
        console.error('Error fetching rankings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch rankings: ' + error.message
        });
    }
});

// Get weekly rankings for a specific week
router.get('/weekly', async (req, res) => {
    try {
        const { start, end, game } = req.query;
        
        if (!start || !end) {
            return res.status(400).json({
                success: false,
                error: 'Start and end dates are required'
            });
        }
        
        const weeklyRanks = await calculateWeeklyRankingsForRange(start, end, game || null);
        
        res.json({
            success: true,
            data: weeklyRanks
        });
    } catch (error) {
        console.error('Error fetching weekly rankings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch weekly rankings: ' + error.message
        });
    }
});

// Get monthly rankings
router.get('/monthly', async (req, res) => {
    try {
        const { year, month, game } = req.query;
        
        if (!year || month === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Year and month are required'
            });
        }
        
        const monthlyRanks = await calculateMonthlyRankings(
            parseInt(year), 
            parseInt(month), 
            game || null
        );
        
        res.json({
            success: true,
            data: monthlyRanks
        });
    } catch (error) {
        console.error('Error fetching monthly rankings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch monthly rankings: ' + error.message
        });
    }
});

// Get game kings (top players per week for a specific game)
router.get('/game-kings', async (req, res) => {
    try {
        const { game } = req.query;
        
        if (!game) {
            return res.status(400).json({
                success: false,
                error: 'Game name is required'
            });
        }
        
        const gameKings = await getGameKings(game);
        
        res.json({
            success: true,
            data: gameKings
        });
    } catch (error) {
        console.error('Error fetching game kings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game kings: ' + error.message
        });
    }
});

// Get available date ranges
router.get('/date-ranges', async (req, res) => {
    try {
        const allWeeks = getRecentWeeks();
        const allMonths = getRecentMonths();
        
        // Get rankings data to filter only weeks/months with data
        const rankings = await getAllRankings();
        const gameDates = new Set(Object.keys(rankings.games));
        const games = new Set();
        
        Object.values(rankings.games).forEach(data => {
            // Only add games that have actual rankings data
            if (data.ranks && data.ranks.length > 0) {
                games.add(data.game);
            }
        });
        
        // Filter weeks to only include those with at least one game
        const weeksWithData = allWeeks.filter(week => {
            const weekStart = new Date(week.start);
            const weekEnd = new Date(week.end);
            
            return Array.from(gameDates).some(dateStr => {
                const gameDate = new Date(dateStr);
                return gameDate >= weekStart && gameDate <= weekEnd;
            });
        });
        
        // Filter months to only include those with at least one game
        const monthsWithData = allMonths.filter(month => {
            const monthStart = new Date(month.start);
            const monthEnd = new Date(month.end);
            
            return Array.from(gameDates).some(dateStr => {
                const gameDate = new Date(dateStr);
                return gameDate >= monthStart && gameDate <= monthEnd;
            });
        });
        
        res.json({
            success: true,
            data: {
                weeks: weeksWithData,
                months: monthsWithData,
                games: Array.from(games).sort()
            }
        });
    } catch (error) {
        console.error('Error fetching date ranges:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch date ranges: ' + error.message
        });
    }
});

module.exports = router;