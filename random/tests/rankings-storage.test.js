const { storeRankings, getAllRankings } = require('../rankings-storage');
const { parseLeaderboardData } = require('../leaderboard-parser');

const testInput = `Word Games Leaderboard 18/06/25 🏆

 1.⁠ ⁠Anushka 0:51 
 2.⁠ ⁠⁠Megha 0:52
 3.⁠ ⁠⁠Shauryaa 1:08

Wordle Leaderboard 16/06/25 🏆

 1.⁠ ⁠Mayank 2/6, 25
 2.⁠ ⁠⁠Sage 3/6, 24
 3.⁠ ⁠⁠Vangi 3/6, 22X`;

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
    console.log('Running rankings storage tests...\n');

    // Test 1: Store rankings
    console.log('Test 1: Store rankings');
    const days = parseLeaderboardData(testInput);
    await storeRankings(days);
    console.log('Rankings stored');

    // Test 2: Retrieve rankings
    console.log('\nTest 2: Retrieve rankings');
    const rankings = await getAllRankings();
    
    assert(rankings.games, 'Rankings should have games object');
    assert(Object.keys(rankings.games).length >= 2, 'Should have at least 2 dates stored');
    
    // Check specific date
    assert(rankings.games['2025-06-18'], 'Should have data for 2025-06-18');
    assert(rankings.games['2025-06-18'].game === 'Word Games', 'Game should be Word Games');
    assert(rankings.games['2025-06-18'].ranks.length === 3, 'Should have 3 players');
    assert(rankings.games['2025-06-18'].ranks[0].name === 'Anushka', 'First player should be Anushka');
    
    console.log('\nStored data structure:');
    console.log(JSON.stringify(rankings, null, 2));

    // Test 3: Update existing date
    console.log('\nTest 3: Update existing date');
    const updateInput = `Word Games Leaderboard 18/06/25 🏆

 1.⁠ ⁠Sage 0:45
 2.⁠ ⁠⁠Anushka 0:51`;
    
    const updateDays = parseLeaderboardData(updateInput);
    await storeRankings(updateDays);
    
    const updatedRankings = await getAllRankings();
    assert(updatedRankings.games['2025-06-18'].ranks.length === 2, 'Should have 2 players after update');
    assert(updatedRankings.games['2025-06-18'].ranks[0].name === 'Sage', 'First player should be Sage after update');

    console.log('\n🎉 All storage tests passed!');
}

// Run the tests
runTests().catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
});