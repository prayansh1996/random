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

// Calculate weekly rankings for a date range
async function calculateWeeklyRankingsForRange(startDate, endDate, gameFilter = null) {
    const rankings = await readRankings();
    const playerScores = {};
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
    
    // Initialize all players with zero scores
    allPlayers.forEach(playerName => {
        playerScores[playerName] = 0;
        playerGameCounts[playerName] = 0;
    });
    
    // Second pass: process each game day and apply scores/penalties
    gameDays.forEach(({ date, data }) => {
        const playersInDay = new Set();
        
        // Record actual ranks for players who participated
        data.ranks.forEach(player => {
            playersInDay.add(player.name);
            playerScores[player.name] += player.rank;
            playerGameCounts[player.name]++;
        });
        
        // Add penalty for missing players
        const maxRank = data.ranks.length + 1;
        allPlayers.forEach(playerName => {
            if (!playersInDay.has(playerName)) {
                playerScores[playerName] += maxRank;
            }
        });
    });
    
    // Convert to sorted array
    const weeklyRanks = Object.entries(playerScores)
        .map(([name, totalScore]) => ({
            name,
            totalScore,
            gamesPlayed: playerGameCounts[name] || 0,
            totalGames: gameDays.length
        }))
        .sort((a, b) => a.totalScore - b.totalScore);
    
    return weeklyRanks;
}

// Calculate monthly rankings with penalty system
async function calculateMonthlyRankings(year, month, gameFilter = null) {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
    
    const rankings = await readRankings();
    const playerScores = {};
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
    
    // Initialize all players with zero scores
    allPlayers.forEach(playerName => {
        playerScores[playerName] = 0;
        playerGameCounts[playerName] = 0;
    });
    
    // Second pass: process each game day and apply scores/penalties
    gameDays.forEach(({ date, data }) => {
        const playersInDay = new Set();
        
        // Record actual ranks for players who participated
        data.ranks.forEach(player => {
            playersInDay.add(player.name);
            playerScores[player.name] += player.rank;
            playerGameCounts[player.name]++;
        });
        
        // Add penalty for missing players
        const maxRank = data.ranks.length + 1;
        allPlayers.forEach(playerName => {
            if (!playersInDay.has(playerName)) {
                playerScores[playerName] += maxRank;
            }
        });
    });
    
    // Convert to sorted array
    const monthlyRanks = Object.entries(playerScores)
        .map(([name, totalScore]) => ({
            name,
            totalScore,
            gamesPlayed: playerGameCounts[name] || 0,
            totalGames: gameDays.length
        }))
        .sort((a, b) => a.totalScore - b.totalScore);
    
    return monthlyRanks;
}

// Get top player for each week for a specific game
async function getGameKings(gameName) {
    const rankings = await readRankings();
    const weeklyWinners = {};
    
    Object.entries(rankings.games).forEach(([date, data]) => {
        if (data.game === gameName) {
            const weekInfo = getWeekRangeForDate(date);
            const weekKey = weekInfo.display;
            
            if (!weeklyWinners[weekKey]) {
                weeklyWinners[weekKey] = {
                    week: weekKey,
                    winners: [],
                    bestRank: Infinity
                };
            }
            
            // Find the best rank for this week
            if (data.ranks.length > 0) {
                const topRank = data.ranks[0].rank;
                if (topRank < weeklyWinners[weekKey].bestRank) {
                    weeklyWinners[weekKey].bestRank = topRank;
                    weeklyWinners[weekKey].winners = [data.ranks[0].name];
                } else if (topRank === weeklyWinners[weekKey].bestRank) {
                    weeklyWinners[weekKey].winners.push(data.ranks[0].name);
                }
            }
        }
    });
    
    return Object.values(weeklyWinners);
}

// Helper function to get week range for a date (Thursday to Wednesday)
function getWeekRangeForDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, etc.
    
    // Calculate days to subtract to get to Thursday
    let daysToThursday;
    if (day >= 4) {
        // Thursday to Saturday: subtract (day - 4) days
        daysToThursday = day - 4;
    } else {
        // Sunday to Wednesday: subtract (day + 3) days to get to previous Thursday
        daysToThursday = day + 3;
    }
    
    const thursday = new Date(date);
    thursday.setDate(date.getDate() - daysToThursday);
    
    const wednesday = new Date(thursday);
    wednesday.setDate(thursday.getDate() + 6);
    
    const formatDate = (d) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}`;
    };
    
    return {
        display: `${formatDate(thursday)} - ${formatDate(wednesday)}`
    };
}

module.exports = {
    storeRankings,
    getAllRankings,
    getRankingsByDateRange,
    getAllPlayers,
    readRankings,
    calculateWeeklyRankingsForRange,
    calculateMonthlyRankings,
    getGameKings
};