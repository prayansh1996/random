const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { parseLeaderboardData, calculateWeeklyRanks } = require('./leaderboard-parser');
const { 
    storeRankings, 
    getAllRankings, 
    calculateRankingsByDateRange
} = require('./rankings-storage');
const { getRecentWeeks, getRecentMonths, formatDate } = require('./date-utils');
const { name } = require('ejs');

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

// Handle immunity pass submissions
router.post('/immunity-pass', express.json(), async (req, res) => {
    try {
        const { data } = req.body;
        const timestamp = new Date().toISOString();
        
        console.log(`\n[${timestamp}] POST /ranks/immunity-pass - REQUEST`);
        
        if (!data || data.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: 'No immunity pass data provided' 
            });
        }
        
        // Parse the input data
        const lines = data.trim().split('\n');
        
        // First line should be the date in DD/MM/YYYY format
        if (lines.length < 2) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid input format. Expected date on first line followed by player entries.' 
            });
        }
        
        const dateStr = lines[0].trim();
        if (!dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid date format. Expected DD/MM/YYYY' 
            });
        }
        
        // Convert date from DD/MM/YYYY to YYYY-MM-DD format
        const [day, month, year] = dateStr.split('/');
        const dateObj = new Date(year, month - 1, day);
        const formattedDate = formatDate(dateObj);
        
        // Parse player entries
        const players = [];
        for (let i = 1; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            if (!trimmedLine) continue;
            
            // Parse each line: "Mayank 2"
            const parts = trimmedLine.split(/\s+/);
            if (parts.length !== 2) {
                console.error(`Invalid line format: ${trimmedLine}`);
                continue;
            }
            
            const [name, pointsStr] = parts;
            const points = parseInt(pointsStr, 10);
            
            if (isNaN(points)) {
                console.error(`Invalid points value: ${pointsStr} in line: ${trimmedLine}`);
                continue;
            }
            
            players.push({ name, points });
        }
        
        if (players.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No valid player entries found in the input data' 
            });
        }
        
        // Read existing adhoc-points.json
        const adhocPointsPath = path.join(__dirname, 'data', 'adhoc-points.json');
        let adhocData = { points: [] };
        
        try {
            const existingData = await fs.readFile(adhocPointsPath, 'utf8');
            adhocData = JSON.parse(existingData);
        } catch (error) {
            console.log('Creating new adhoc-points.json file');
        }
        
        // Find existing entry for this date or create new one
        const existingIndex = adhocData.points.findIndex(entry => entry.date === formattedDate);
        
        if (existingIndex !== -1) {
            // Overwrite existing data for this date
            adhocData.points[existingIndex] = {
                date: formattedDate,
                players: players
            };
            console.log(`Overwriting existing data for date: ${formattedDate}`);
        } else {
            // Add new entry for this date
            adhocData.points.push({
                date: formattedDate,
                players: players
            });
            console.log(`Adding new data for date: ${formattedDate}`);
        }
        
        // Sort points by date
        adhocData.points.sort((a, b) => a.date.localeCompare(b.date));
        
        // Write updated data back to file
        await fs.writeFile(adhocPointsPath, JSON.stringify(adhocData, null, 2));
        
        console.log(`Processed ${players.length} player entries for date ${formattedDate}`);
        console.log('Updated adhoc-points.json successfully');
        
        res.json({
            success: true,
            date: formattedDate,
            playersProcessed: players.length
        });
        
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR in /ranks/immunity-pass:`, error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to process immunity pass data: ' + error.message
        });
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
        
        const weeklyRanks = await calculateRankingsByDateRange(start, end, game || null);
        
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

// Get rankings for custom date range
router.get('/custom-range', async (req, res) => {
    try {
        const { start, end, game } = req.query;
        
        // If no dates provided, use all available dates
        let startDate = start;
        let endDate = end;
        
        if (!startDate || !endDate) {
            const rankings = await getAllRankings();
            const dates = Object.keys(rankings.games).sort();
            
            if (dates.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    dateRange: 'No data available'
                });
            }
            
            startDate = startDate || dates[0];
            endDate = endDate || dates[dates.length - 1];
        }
        
        const customRanks = await calculateRankingsByDateRange(startDate, endDate, game || null);
        
        res.json({
            success: true,
            data: customRanks,
            dateRange: {
                start: startDate,
                end: endDate,
                game: game || 'All Games'
            }
        });
    } catch (error) {
        console.error('Error fetching custom range rankings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch rankings: ' + error.message
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

// Get raw rankings in readable format
router.get('/raw', async (req, res) => {
    try {
        const rankings = await getAllRankings();
        
        // Create a readable text format
        let output = 'CONUNDRUM CLUB GAME RANKINGS\n';
        output += '============================\n\n';
        
        // Sort dates in reverse chronological order
        const sortedDates = Object.keys(rankings.games).sort((a, b) => b.localeCompare(a));
        
        sortedDates.forEach(date => {
            const gameData = rankings.games[date];
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            output += `${formattedDate}\n`;
            output += `Game: ${gameData.game}\n`;
            
            if (gameData.ranks && gameData.ranks.length > 0) {
                output += `Players: ${gameData.ranks.length}\n`;
                output += '\nRankings:\n';
                
                gameData.ranks.forEach(player => {
                    output += `  ${player.rank}. ${player.name}\n`;
                });
            } else {
                output += 'No players recorded\n';
            }
            
            output += '\n' + '-'.repeat(40) + '\n\n';
        });
        
        // Load and display adhoc points
        try {
            const adhocPointsPath = path.join(__dirname, 'data', 'adhoc-points.json');
            const adhocData = await fs.readFile(adhocPointsPath, 'utf8');
            const adhocPoints = JSON.parse(adhocData);
            
            if (adhocPoints.points && adhocPoints.points.length > 0) {
                output += '\n\nADHOC IMMUNITY PASS POINTS\n';
                output += '==========================\n\n';
                
                // Sort adhoc points by date in reverse chronological order
                const sortedAdhocDates = adhocPoints.points.sort((a, b) => b.date.localeCompare(a.date));
                
                sortedAdhocDates.forEach(entry => {
                    const dateObj = new Date(entry.date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    output += `${formattedDate}\n`;
                    output += `Players: ${entry.players.length}\n\n`;
                    
                    entry.players.forEach(player => {
                        output += `  ${player.name}: ${player.points} points\n`;
                    });
                    
                    output += '\n' + '-'.repeat(40) + '\n\n';
                });
            }
        } catch (error) {
            console.log('No adhoc points data found');
        }
        
        // Send as plain text
        res.type('text/plain');
        res.send(output);
    } catch (error) {
        console.error('Error fetching raw rankings:', error);
        res.status(500).send('Failed to fetch rankings: ' + error.message);
    }
});

module.exports = router;