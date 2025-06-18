const { parseLeaderboardData, calculateWeeklyRanks } = require('../leaderboard-parser');

const testInput = `Word Games Leaderboard 18/06/25 🏆

 1.⁠ ⁠Anushka 0:51 
 2.⁠ ⁠⁠Megha 0:52
 3.⁠ ⁠⁠Shauryaa 1:08
 4.⁠ ⁠⁠Sankar 1:14
 5.⁠ ⁠⁠Sonakshi 1:16
 6.⁠ ⁠⁠Monika 1:31
 7.⁠ ⁠⁠Aastha 1:36
 8.⁠ ⁠⁠Mayank 1:42
 9.⁠ ⁠⁠Shubham 1:49
10.⁠ ⁠⁠Prakriti 1:55
11.⁠ ⁠⁠AkD 2:04
12.⁠ ⁠⁠Pruthvi 2:09
13.⁠ ⁠⁠Sage 2:19
14.⁠ ⁠⁠Shivangi 2:21
15.⁠ ⁠⁠Shruthi 2:25
16.⁠ ⁠⁠Prayansh 2:33
17.⁠ ⁠⁠Srishti 2:39


Wordle Leaderboard 16/06/25 🏆

 1.⁠ ⁠Mayank 2/6, 25
 2.⁠ ⁠⁠Sage 3/6, 24
 3.⁠ ⁠⁠Vangi 3/6, 22X
 4.⁠ ⁠⁠Shubham 3/6
 5.⁠ ⁠⁠Keshav 4/6, 24
 6.⁠ ⁠⁠Srishti 4/6, 19X
 7.⁠ ⁠⁠Aastha 4/6, 22X
 8.⁠ ⁠⁠Prayansh 4/6, 24X
 9.⁠ ⁠⁠Akd, Monika, Prakriti, Megha 4/6
10.⁠ ⁠⁠Sankar 5/6, 22
11.⁠ ⁠⁠Saras 5/6, 27
12.⁠ ⁠⁠Manav and Paarth 5/6, 20X
13.⁠ ⁠⁠Pruthvi 5/6
14.⁠ ⁠⁠Anushka 6/6


Sunday Marathon Leaderboard 15/06/25 🏆

 1.⁠ ⁠Sage 2, 5000, 12:41
 2.⁠ ⁠⁠Prakriti 2, 4500, 2:07
 3.⁠ ⁠⁠Sankar 2, 4470, 1:09
 4.⁠ ⁠⁠Aastha 3, 3500, 1:29
 5.⁠ ⁠⁠Anushka 3, 3480, 10:38
 6.⁠ ⁠⁠Shauryaa 4, 7500, 0:56
 7.⁠ ⁠⁠Megha 4, 6400, 1:15
 8.⁠ ⁠⁠Mayank 4, 3500, 1:18
 9.⁠ ⁠⁠Keshav 5, 6000, 0:10
10.⁠ ⁠⁠Srishti 5, 4500, 1:16
11.⁠ ⁠⁠Shivangi 5, 3500, 0:19
12.⁠ ⁠⁠Manav 4, 5000, X
13.⁠ ⁠⁠Shruthi 5, X, 2:34
14.⁠ ⁠⁠Shubham 8, 5000, X
15.⁠ ⁠⁠Sanchit and Pruthvi 4, X, X
16.⁠ ⁠⁠Prayansh 5, X, X


Geo Leaderboard 14/06/25 🏆

1.⁠ ⁠Sankar 3/7, 41,766
2.⁠ ⁠⁠Srishti 3/7, 26,420
3.⁠ ⁠⁠Prakriti and Arnab 3/7
4.⁠ ⁠⁠Pruthvi 4/7, 27, 523
5.⁠ ⁠⁠Sage 4/7, 22,872
6.⁠ ⁠⁠Mayank and Prayansh 4/7
7.⁠ ⁠⁠Manav and Shubham 5/7
8.⁠ ⁠⁠Revati 7/7, 34,247
9.⁠ ⁠⁠Aastha, Anushka and Akd 7/7`;

// Simple test framework
function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

function runTests() {
    console.log('Running leaderboard parser tests...\n');

    // Test 1: Parse leaderboard data
    console.log('Test 1: parseLeaderboardData');
    const days = parseLeaderboardData(testInput);
    
    assert(days.length === 4, 'Should parse 4 days');
    assert(days[0].game === 'Word Games', 'First day should be Word Games');
    assert(days[0].date === '18/06/25', 'First day date should be 18/06/25');
    assert(days[0].players.length === 17, 'Word Games should have 17 players');
    
    assert(days[1].game === 'Wordle', 'Second day should be Wordle');
    assert(days[1].date === '16/06/25', 'Second day date should be 16/06/25');
    assert(days[1].players.length === 18, 'Wordle should have 18 players');
    
    assert(days[2].game === 'Sunday Marathon', 'Third day should be Sunday Marathon');
    assert(days[2].date === '15/06/25', 'Third day date should be 15/06/25');
    assert(days[2].players.length === 17, 'Sunday Marathon should have 17 players');
    
    assert(days[3].game === 'Geo', 'Fourth day should be Geo');
    assert(days[3].date === '14/06/25', 'Fourth day date should be 14/06/25');
    assert(days[3].players.length === 14, 'Geo should have 14 players');

    // Test 2: Check specific player rankings
    console.log('\nTest 2: Player rankings');
    const wordGamesAnushka = days[0].players.find(p => p.name === 'Anushka');
    assert(wordGamesAnushka && wordGamesAnushka.rank === 1, 'Anushka should be rank 1 in Word Games');
    
    const wordleMultiplePlayers = days[1].players.filter(p => p.rank === 9);
    assert(wordleMultiplePlayers.length === 4, 'Should have 4 players at rank 9 in Wordle');
    assert(wordleMultiplePlayers.some(p => p.name === 'Akd'), 'Akd should be rank 9 in Wordle');
    assert(wordleMultiplePlayers.some(p => p.name === 'Monika'), 'Monika should be rank 9 in Wordle');
    
    const marathonTiedPlayers = days[2].players.filter(p => p.rank === 15);
    assert(marathonTiedPlayers.length === 2, 'Should have 2 players at rank 15 in Sunday Marathon');
    assert(marathonTiedPlayers.some(p => p.name === 'Sanchit'), 'Sanchit should be rank 15');
    assert(marathonTiedPlayers.some(p => p.name === 'Pruthvi'), 'Pruthvi should be rank 15');

    // Test 3: Check "and" separated players
    console.log('\nTest 3: AND separated players');
    const geoTiedPlayers = days[3].players.filter(p => p.rank === 3);
    assert(geoTiedPlayers.length === 2, 'Should have 2 players at rank 3 in Geo');
    assert(geoTiedPlayers.some(p => p.name === 'Prakriti'), 'Prakriti should be rank 3 in Geo');
    assert(geoTiedPlayers.some(p => p.name === 'Arnab'), 'Arnab should be rank 3 in Geo');

    // Test 4: Calculate weekly ranks
    console.log('\nTest 4: calculateWeeklyRanks');
    const weeklyRanks = calculateWeeklyRanks(days);
    
    assert(weeklyRanks.length > 20, 'Should have more than 20 unique players');
    assert(weeklyRanks[0].totalRank < weeklyRanks[weeklyRanks.length - 1].totalRank, 
           'Rankings should be sorted in ascending order');

    // Test specific player calculations
    const anushkaRank = weeklyRanks.find(p => p.name === 'Anushka');
    const sankarRank = weeklyRanks.find(p => p.name === 'Sankar');
    const sageRank = weeklyRanks.find(p => p.name === 'Sage');
    
    assert(anushkaRank, 'Anushka should be in weekly ranks');
    assert(sankarRank, 'Sankar should be in weekly ranks');
    assert(sageRank, 'Sage should be in weekly ranks');
    
    // Verify Sankar has the best total (lowest)
    // Sankar: Word Games(4) + Wordle(10) + Marathon(3) + Geo(1) = 18
    assert(sankarRank.totalRank === 18, 'Sankar should have total rank of 18');
    
    // Test 5: Players who didn't participate in all games
    console.log('\nTest 5: Missing player penalties');
    const vangiRank = weeklyRanks.find(p => p.name === 'Vangi');
    const arnabRank = weeklyRanks.find(p => p.name === 'Arnab');
    
    assert(vangiRank, 'Vangi should be in weekly ranks');
    assert(arnabRank, 'Arnab should be in weekly ranks');
    
    // Vangi only played Wordle, so should have penalty ranks for other 3 days
    // Wordle rank: 3, penalties: 18 (Word Games) + 18 (Marathon) + 15 (Geo) = 54
    assert(vangiRank.totalRank === 54, 'Vangi should have total rank of 54');

    console.log('\n🎉 All tests passed!');
}

// Run the tests
runTests();