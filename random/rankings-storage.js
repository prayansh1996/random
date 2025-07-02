const fs = require('fs').promises;
const path = require('path');

const RANKINGS_FILE = path.join(__dirname, 'data', 'game-rankings.json');

// Ensure the data directory and file exist
async function ensureDataFile() {
    try {
        await fs.access(RANKINGS_FILE);
    } catch (error) {
        // File doesn't exist, create it with initial structure
        const initialData = { games: {} };
        await fs.writeFile(RANKINGS_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Read rankings from file
async function readRankings() {
    await ensureDataFile();
    const data = await fs.readFile(RANKINGS_FILE, 'utf8');
    return JSON.parse(data);
}

// Write rankings to file
async function writeRankings(data) {
    await ensureDataFile();
    await fs.writeFile(RANKINGS_FILE, JSON.stringify(data, null, 2));
}

// Store or update rankings for given dates
async function storeRankings(parsedDays) {
    const rankings = await readRankings();
    
    // Process each day's data
    parsedDays.forEach(day => {
        // Convert date format from DD/MM/YY to YYYY-MM-DD for consistency
        const [dd, mm, yy] = day.date.split('/');
        const year = '20' + yy; // Assuming 20xx for YY format
        const formattedDate = `${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        
        // Initialize date if it doesn't exist
        if (!rankings.games[formattedDate]) {
            rankings.games[formattedDate] = {};
        }
        
        // Store game and sorted ranks for this date
        rankings.games[formattedDate] = {
            game: day.game,
            ranks: day.players
                .sort((a, b) => a.rank - b.rank)
                .map(player => ({
                    rank: player.rank,
                    name: player.name
                }))
        };
    });
    
    await writeRankings(rankings);
    return rankings;
}

// Get all stored rankings
async function getAllRankings() {
    return await readRankings();
}

// Get rankings for a specific date range
async function getRankingsByDateRange(startDate, endDate) {
    const rankings = await readRankings();
    const result = {};
    
    Object.keys(rankings.games).forEach(date => {
        if (date >= startDate && date <= endDate) {
            result[date] = rankings.games[date];
        }
    });
    
    return result;
}

// Get all unique players across all games
async function getAllPlayers() {
    const rankings = await readRankings();
    const players = new Set();
    
    Object.values(rankings.games).forEach(dateData => {
        dateData.ranks.forEach(player => {
            players.add(player.name);
        });
    });
    
    return Array.from(players).sort();
}

// Calculate rankings from provided data (points-based system) - pure function for testing
function calculateRankingsFromData(rankings, startDate, endDate, gameFilter = null) {
    const playerPoints = {};
    const playerGameCounts = {};
    const allPlayers = new Set();
    const gameDays = [];
    
    // First pass: collect all players and game days
    Object.entries(rankings.games).forEach(([date, data]) => {
        if (date >= startDate && date <= endDate) {
            // Apply game filter if specified
            if (gameFilter && data.game !== gameFilter) {
                return;
            }
            
            // Store game day info
            gameDays.push({ date, data });
            
            // Collect all unique players
            data.ranks.forEach(player => {
                allPlayers.add(player.name);
            });
        }
    });
    
    // Initialize all players with zero points
    allPlayers.forEach(playerName => {
        playerPoints[playerName] = 0;
        playerGameCounts[playerName] = 0;
    });
    
    // Second pass: process each game day and calculate points
    gameDays.forEach(({ date, data }) => {
        const numberOfPlayers = data.ranks.length;
        const playersInDay = new Set();
        
        // Calculate points for players who participated
        // Points = Number of players - Rank + 1
        data.ranks.forEach(player => {
            playersInDay.add(player.name);
            const points = numberOfPlayers - player.rank + 1;
            playerPoints[player.name] += points;
            playerGameCounts[player.name]++;
        });
        
        // Players who didn't participate get 0 points (no penalty needed)
        // This is already handled by initialization
    });
    
    // Convert to sorted array (higher points = better)
    const weeklyRanks = Object.entries(playerPoints)
        .map(([name, totalPoints]) => ({
            name,
            totalScore: totalPoints,
            gamesPlayed: playerGameCounts[name] || 0,
            totalGames: gameDays.length
        }))
        .sort((a, b) => b.totalScore - a.totalScore); // Sort descending (higher points first)
    
    return weeklyRanks;
}

// Calculate rankings for a date range (points-based system) - wrapper that reads from file
async function calculateRankingsByDateRange(startDate, endDate, gameFilter = null) {
    const rankings = await readRankings();
    return calculateRankingsFromData(rankings, startDate, endDate, gameFilter);
}


module.exports = {
    storeRankings,
    getAllRankings,
    getRankingsByDateRange,
    getAllPlayers,
    readRankings,
    calculateRankingsByDateRange,
    calculateRankingsFromData
};