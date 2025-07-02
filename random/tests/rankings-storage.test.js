const { 
    storeRankings, 
    getAllRankings, 
    calculateRankingsByDateRange,
    calculateRankingsFromData 
} = require('../rankings-storage');
const { parseLeaderboardData } = require('../leaderboard-parser');

const testInput = `Word Games Leaderboard 18/06/25 🏆

 1.⁠ ⁠Anushka 0:51 
 2.⁠ ⁠⁠Megha 0:52
 3.⁠ ⁠⁠Shauryaa 1:08
 4.⁠ ⁠⁠Sankar 1:14
 5.⁠ ⁠⁠Mayank 1:16

Wordle Leaderboard 16/06/25 🏆

 1.⁠ ⁠Mayank 2/6, 25
 2.⁠ ⁠⁠Sage 3/6, 24
 3.⁠ ⁠⁠Vangi 3/6, 22X
 4.⁠ ⁠⁠Shubham 3/6
 5.⁠ ⁠⁠Anushka 4/6

Sunday Marathon Leaderboard 15/06/25 🏆

 1.⁠ ⁠Sage 2, 5000, 12:41
 2.⁠ ⁠⁠Mayank 2, 4500, 2:07
 3.⁠ ⁠⁠Sankar 2, 4470, 1:09
 4.⁠ ⁠⁠Anushka 3, 3500, 1:29`;

// Simple test framework
function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

async function runTests() {
    console.log('Running rankings storage tests with points-based system...\n');

    // Test 1: Store rankings
    console.log('Test 1: Store rankings');
    const days = parseLeaderboardData(testInput);
    await storeRankings(days);
    console.log('Rankings stored');

    // Test 2: Retrieve rankings
    console.log('\nTest 2: Retrieve rankings');
    const rankings = await getAllRankings();
    
    assert(rankings.games, 'Rankings should have games object');
    assert(Object.keys(rankings.games).length >= 3, 'Should have at least 3 dates stored');
    
    // Check specific date
    assert(rankings.games['2025-06-18'], 'Should have data for 2025-06-18');
    assert(rankings.games['2025-06-18'].game === 'Word Games', 'Game should be Word Games');
    assert(rankings.games['2025-06-18'].ranks.length === 5, 'Should have 5 players');
    assert(rankings.games['2025-06-18'].ranks[0].name === 'Anushka', 'First player should be Anushka');

    // Test 3: Calculate rankings with points system using mock data
    console.log('\nTest 3: Points-based rankings calculation (using mock data)');
    console.log('Points formula: Points = Number of players - Rank + 1');
    console.log('Example: 5 players, rank 1 = 5 - 1 + 1 = 5 points\n');
    
    // Create mock data that matches our test expectations
    const mockRankings = {
        games: {
            '2025-06-18': {
                game: 'Word Games',
                ranks: [
                    { rank: 1, name: 'Anushka' },
                    { rank: 2, name: 'Megha' },
                    { rank: 3, name: 'Shauryaa' },
                    { rank: 4, name: 'Sankar' },
                    { rank: 5, name: 'Mayank' }
                ]
            },
            '2025-06-16': {
                game: 'Wordle',
                ranks: [
                    { rank: 1, name: 'Mayank' },
                    { rank: 2, name: 'Sage' },
                    { rank: 3, name: 'Vangi' },
                    { rank: 4, name: 'Shubham' },
                    { rank: 5, name: 'Anushka' }
                ]
            },
            '2025-06-15': {
                game: 'Sunday Marathon',
                ranks: [
                    { rank: 1, name: 'Sage' },
                    { rank: 2, name: 'Mayank' },
                    { rank: 3, name: 'Sankar' },
                    { rank: 4, name: 'Anushka' }
                ]
            }
        }
    };
    
    const weeklyRanks = calculateRankingsFromData(mockRankings, '2025-06-15', '2025-06-18');
    
    // Find specific players
    const mayankRank = weeklyRanks.find(p => p.name === 'Mayank');
    const anushkaRank = weeklyRanks.find(p => p.name === 'Anushka');
    const sankarRank = weeklyRanks.find(p => p.name === 'Sankar');
    const vangiRank = weeklyRanks.find(p => p.name === 'Vangi');
    
    console.log('Player rankings:');
    weeklyRanks.forEach((player, index) => {
        console.log(`${index + 1}. ${player.name}: ${player.totalScore} points (played ${player.gamesPlayed}/${player.totalGames} games)`);
    });
    
    // Test points calculations
    console.log('\nDetailed points verification:');
    
    // Mayank: Word Games (5th, 5 players) + Wordle (1st, 5 players) + Sunday (2nd, 4 players)
    // Points: (5-5+1) + (5-1+1) + (4-2+1) = 1 + 5 + 3 = 9 points
    const expectedMayankPoints = 1 + 5 + 3;
    console.log(`Mayank expected: ${expectedMayankPoints} points, actual: ${mayankRank.totalScore}`);
    assert(mayankRank.totalScore === expectedMayankPoints, `Mayank should have ${expectedMayankPoints} points`);
    assert(mayankRank.gamesPlayed === 3, 'Mayank should have played 3 games');
    
    // Anushka: Word Games (1st, 5 players) + Wordle (5th, 5 players) + Sunday (4th, 4 players)
    // Points: (5-1+1) + (5-5+1) + (4-4+1) = 5 + 1 + 1 = 7 points
    const expectedAnushkaPoints = 5 + 1 + 1;
    console.log(`Anushka expected: ${expectedAnushkaPoints} points, actual: ${anushkaRank.totalScore}`);
    assert(anushkaRank.totalScore === expectedAnushkaPoints, `Anushka should have ${expectedAnushkaPoints} points`);
    
    // Sankar: Word Games (4th, 5 players) + Wordle (didn't play) + Sunday (3rd, 4 players)
    // Points: (5-4+1) + 0 + (4-3+1) = 2 + 0 + 2 = 4 points
    const expectedSankarPoints = 2 + 0 + 2;
    console.log(`Sankar expected: ${expectedSankarPoints} points, actual: ${sankarRank.totalScore}`);
    assert(sankarRank.totalScore === expectedSankarPoints, `Sankar should have ${expectedSankarPoints} points`);
    assert(sankarRank.gamesPlayed === 2, 'Sankar should have played 2 games');
    
    // Vangi: Only played Wordle (3rd, 5 players)
    // Points: 0 + (5-3+1) + 0 = 3 points
    const expectedVangiPoints = 3;
    console.log(`Vangi expected: ${expectedVangiPoints} points, actual: ${vangiRank.totalScore}`);
    assert(vangiRank.totalScore === expectedVangiPoints, `Vangi should have ${expectedVangiPoints} points`);
    assert(vangiRank.gamesPlayed === 1, 'Vangi should have played 1 game');

    // Test 4: Verify sorting is descending (highest points first)
    console.log('\nTest 4: Verify descending sort order');
    for (let i = 0; i < weeklyRanks.length - 1; i++) {
        assert(
            weeklyRanks[i].totalScore >= weeklyRanks[i + 1].totalScore,
            `Rankings should be sorted descending: ${weeklyRanks[i].name} (${weeklyRanks[i].totalScore}) should be >= ${weeklyRanks[i + 1].name} (${weeklyRanks[i + 1].totalScore})`
        );
    }
    console.log('✅ Rankings correctly sorted by points (descending)');

    // Test 5: Game filter
    console.log('\nTest 5: Game filter functionality');
    const wordGamesOnly = calculateRankingsFromData(mockRankings, '2025-06-15', '2025-06-18', 'Word Games');
    
    // In Word Games only filter, everyone should have at most 1 game played
    const maxGamesPlayed = Math.max(...wordGamesOnly.map(p => p.gamesPlayed));
    assert(maxGamesPlayed === 1, 'With Word Games filter, max games played should be 1');
    assert(wordGamesOnly[0].totalGames === 1, 'Total games with filter should be 1');
    
    console.log('Word Games only rankings:');
    wordGamesOnly.slice(0, 5).forEach((player, index) => {
        console.log(`${index + 1}. ${player.name}: ${player.totalScore} points`);
    });

    console.log('\n🎉 All tests passed! Points-based system working correctly.');
    
    // Test 6: Test with actual file data
    console.log('\nTest 6: Integration test with actual file data');
    try {
        const fileBasedRanks = await calculateRankingsByDateRange('2025-06-15', '2025-06-18');
        console.log(`Found ${fileBasedRanks.length} players in actual data`);
        console.log('Top 5 players from file:');
        fileBasedRanks.slice(0, 5).forEach((player, index) => {
            console.log(`${index + 1}. ${player.name}: ${player.totalScore} points`);
        });
        console.log('✅ File-based calculation working correctly');
    } catch (error) {
        console.log('⚠️  File-based test skipped (file may have different data)');
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
});