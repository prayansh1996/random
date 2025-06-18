// Parser function to extract player rankings from leaderboard text
function parseLeaderboardData(text) {
    const days = [];
    const lines = text.split('\n');
    let currentDay = null;
    let currentGame = null;
    
    for (const line of lines) {
        // Check for date headers (e.g., "Word Games Leaderboard 18/06/25 🏆")
        const dateMatch = line.match(/(\w+(?:\s+\w+)*)\s+Leaderboard\s+(\d{2}\/\d{2}\/\d{2})/);
        if (dateMatch) {
            const [, gameName, date] = dateMatch;
            currentDay = { date, game: gameName, players: [] };
            currentGame = gameName;
            days.push(currentDay);
            continue;
        }
        
        // More flexible regex to handle various formats and special characters
        // Match lines that start with a number followed by a period
        const cleanLine = line.replace(/[⁠]/g, ' ').trim(); // Remove special Unicode characters
        const rankMatch = cleanLine.match(/^(\d+)\.\s*(.+?)(?:\s+(?:\d+\/\d+|\d+:\d+|[\d,]+|X).*)?$/);
        
        if (rankMatch && currentDay) {
            const [, rank, remainingText] = rankMatch;
            
            // Extract player names from the remaining text
            // Split on common score patterns to isolate names
            let playerSection = remainingText;
            
            // Remove score patterns from the end
            playerSection = playerSection.replace(/\s+\d+\/\d+.*$/, ''); // Remove fractions (e.g., 2/6)
            playerSection = playerSection.replace(/\s+\d+:\d+.*$/, ''); // Remove times (e.g., 0:51)
            playerSection = playerSection.replace(/\s+\d+,\s*\d+.*$/, ''); // Remove comma-separated numbers
            playerSection = playerSection.replace(/\s+X.*$/, ''); // Remove X patterns
            playerSection = playerSection.trim();
            
            // Handle multiple players (separated by "and", commas, or both)
            let players = [];
            
            // First split by comma, then check each part for "and"
            const commaParts = playerSection.split(',').map(p => p.trim());
            for (const part of commaParts) {
                if (part.includes(' and ')) {
                    // Split by "and"
                    const andParts = part.split(/\s+and\s+/).map(p => p.trim());
                    players.push(...andParts);
                } else {
                    players.push(part);
                }
            }
            
            // Filter out empty names and clean up
            players = players
                .map(name => name.trim())
                .filter(name => name && name.length > 0 && /[A-Za-z]/.test(name));
            
            // Add each player with their rank
            players.forEach(playerName => {
                // Clean up the player name
                playerName = playerName.replace(/[^A-Za-z\s]/g, '').trim();
                if (playerName) {
                    currentDay.players.push({
                        name: playerName,
                        rank: parseInt(rank),
                        game: currentGame
                    });
                }
            });
        }
    }
    
    return days;
}

// Calculate weekly ranks
function calculateWeeklyRanks(days) {
    const playerRanks = {};
    const allPlayers = new Set();
    
    // Collect all unique players
    days.forEach(day => {
        day.players.forEach(player => {
            allPlayers.add(player.name);
        });
    });
    
    // Initialize player rank sums
    allPlayers.forEach(player => {
        playerRanks[player] = 0;
    });
    
    // Calculate ranks for each day
    days.forEach(day => {
        const playersInDay = new Set(day.players.map(p => p.name));
        const maxRank = day.players.length + 1;
        
        // Add actual ranks for players who played
        day.players.forEach(player => {
            playerRanks[player.name] += player.rank;
        });
        
        // Add penalty rank for players who didn't play
        allPlayers.forEach(player => {
            if (!playersInDay.has(player)) {
                playerRanks[player] += maxRank;
            }
        });
    });
    
    // Convert to sorted array
    const sortedRanks = Object.entries(playerRanks)
        .map(([name, totalRank]) => ({ name, totalRank }))
        .sort((a, b) => a.totalRank - b.totalRank);
    
    return sortedRanks;
}

module.exports = {
    parseLeaderboardData,
    calculateWeeklyRanks
};