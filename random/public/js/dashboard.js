// Dashboard functionality for Conundrum Club

let dateRanges = {
    weeks: [],
    months: [],
    games: []
};

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadDateRanges();
    setupEventListeners();
    
    // Load initial data
    if (dateRanges.weeks.length > 0) {
        loadWeeklyRankings();
    }
    if (dateRanges.months.length > 0) {
        loadMonthlyRankings();
    }
    if (dateRanges.games.length > 0) {
        loadGameKings();
    }
});

// Load available date ranges and games
async function loadDateRanges() {
    try {
        const baseUrl = window.location.pathname.includes('/random') ? '/random' : '';
        const response = await fetch(`${baseUrl}/ranks/date-ranges`);
        const data = await response.json();
        
        if (data.success) {
            dateRanges = data.data;
            populateSelects();
        }
    } catch (error) {
        console.error('Error loading date ranges:', error);
    }
}

// Populate select dropdowns
function populateSelects() {
    // Populate week select
    const weekSelect = document.getElementById('weekSelect');
    weekSelect.innerHTML = '';
    dateRanges.weeks.forEach((week, index) => {
        const option = document.createElement('option');
        option.value = JSON.stringify({ start: week.start, end: week.end });
        option.textContent = week.display;
        if (index === 0) option.selected = true;
        weekSelect.appendChild(option);
    });
    
    // Populate month select
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.innerHTML = '';
    dateRanges.months.forEach((month, index) => {
        const option = document.createElement('option');
        const date = new Date(month.start);
        option.value = JSON.stringify({ year: date.getFullYear(), month: date.getMonth() });
        option.textContent = month.display;
        if (index === 0) option.selected = true;
        monthSelect.appendChild(option);
    });
    
    // Populate game king select only
    const gameKingSelect = document.getElementById('gameKingSelect');
    gameKingSelect.innerHTML = '';
    dateRanges.games.forEach((game, index) => {
        const option = document.createElement('option');
        option.value = game;
        option.textContent = game;
        if (index === 0) option.selected = true;
        gameKingSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('weekSelect').addEventListener('change', loadWeeklyRankings);
    document.getElementById('monthSelect').addEventListener('change', loadMonthlyRankings);
    document.getElementById('gameKingSelect').addEventListener('change', loadGameKings);
}

// Load weekly rankings
async function loadWeeklyRankings() {
    try {
        const weekData = JSON.parse(document.getElementById('weekSelect').value);
        
        const baseUrl = window.location.pathname.includes('/random') ? '/random' : '';
        const params = new URLSearchParams({
            start: weekData.start,
            end: weekData.end
        });
        
        const response = await fetch(`${baseUrl}/ranks/weekly?${params}`);
        const data = await response.json();
        
        if (data.success) {
            displayWeeklyRankings(data.data);
        }
    } catch (error) {
        console.error('Error loading weekly rankings:', error);
    }
}

// Display weekly rankings
function displayWeeklyRankings(rankings) {
    const tbody = document.getElementById('weeklyTableBody');
    tbody.innerHTML = '';
    
    rankings.forEach((player, index) => {
        const row = tbody.insertRow();
        row.className = index < 3 ? 'highlight-row' : '';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.totalScore}</td>
        `;
    });
    
    if (rankings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No data available</td></tr>';
    }
}

// Load monthly rankings
async function loadMonthlyRankings() {
    try {
        const monthData = JSON.parse(document.getElementById('monthSelect').value);
        
        const baseUrl = window.location.pathname.includes('/random') ? '/random' : '';
        const params = new URLSearchParams({
            year: monthData.year,
            month: monthData.month
        });
        
        const response = await fetch(`${baseUrl}/ranks/monthly?${params}`);
        const data = await response.json();
        
        if (data.success) {
            displayMonthlyRankings(data.data);
        }
    } catch (error) {
        console.error('Error loading monthly rankings:', error);
    }
}

// Display monthly rankings
function displayMonthlyRankings(rankings) {
    const tbody = document.getElementById('monthlyTableBody');
    tbody.innerHTML = '';
    
    rankings.forEach((player, index) => {
        const row = tbody.insertRow();
        row.className = index < 3 ? 'highlight-row' : '';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.totalScore}</td>
        `;
    });
    
    if (rankings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No data available (min 5 games required)</td></tr>';
    }
}

// Load game kings
async function loadGameKings() {
    try {
        const game = document.getElementById('gameKingSelect').value;
        
        const baseUrl = window.location.pathname.includes('/random') ? '/random' : '';
        const params = new URLSearchParams({ game });
        
        const response = await fetch(`${baseUrl}/ranks/game-kings?${params}`);
        const data = await response.json();
        
        if (data.success) {
            displayGameKings(data.data);
        }
    } catch (error) {
        console.error('Error loading game kings:', error);
    }
}

// Display game kings
function displayGameKings(gameKings) {
    const tbody = document.getElementById('gameKingsTableBody');
    tbody.innerHTML = '';
    
    // Filter out weeks with no winners or null data
    const validGameKings = gameKings.filter(week => 
        week.winners && week.winners.length > 0 && week.bestRank !== null
    );
    
    // Sort by week (most recent first)
    validGameKings.sort((a, b) => {
        // Extract dates from week display format
        const getDateFromWeek = (week) => {
            const match = week.match(/(\w+)\s+(\d+)\s+-\s+(\w+)\s+(\d+)/);
            if (match) {
                const endMonth = match[3];
                const endDay = match[4];
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthIndex = months.indexOf(endMonth);
                return new Date(2025, monthIndex, parseInt(endDay));
            }
            return new Date();
        };
        
        return getDateFromWeek(b.week) - getDateFromWeek(a.week);
    });
    
    validGameKings.forEach((week) => {
        const row = tbody.insertRow();
        
        // Only show the first (top) player, not all winners
        const topPlayer = week.winners[0];
        
        row.innerHTML = `
            <td>${week.week}</td>
            <td>${topPlayer}</td>
            <td>${week.bestRank}</td>
        `;
    });
    
    if (validGameKings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No data available</td></tr>';
    }
}