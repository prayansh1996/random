// Dashboard functionality for Conundrum Club

let availableGames = [];
let minDate = null;
let maxDate = null;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadAvailableData();
    setupEventListeners();
    
    // Load initial rankings (all dates, all games)
    loadRankings();
});

// Load available games and date ranges
async function loadAvailableData() {
    try {
        const baseUrl = window.location.pathname.includes('/random') ? '/random' : '';
        const response = await fetch(`${baseUrl}/ranks/data`);
        const data = await response.json();
        
        if (data.success) {
            const rankings = data.data.games;
            const dates = Object.keys(rankings).sort();
            
            // Get unique games
            const gamesSet = new Set();
            Object.values(rankings).forEach(day => {
                if (day.ranks && day.ranks.length > 0) {
                    gamesSet.add(day.game);
                }
            });
            availableGames = Array.from(gamesSet).sort();
            
            // Set min and max dates
            if (dates.length > 0) {
                minDate = dates[0];
                maxDate = dates[dates.length - 1];
                
                // Set date picker constraints
                const startDateInput = document.getElementById('startDate');
                const endDateInput = document.getElementById('endDate');
                
                // Get today's date in YYYY-MM-DD format
                const today = new Date().toISOString().split('T')[0];
                
                startDateInput.min = minDate;
                startDateInput.max = today;
                endDateInput.min = minDate;
                endDateInput.max = today;
                
                // Set default values: first game date to today
                startDateInput.value = minDate;
                endDateInput.value = today;
            }
            
            // Populate game dropdown
            populateGameSelect();
        }
    } catch (error) {
        console.error('Error loading available data:', error);
    }
}

// Populate game dropdown
function populateGameSelect() {
    const gameSelect = document.getElementById('gameSelect');
    
    // Keep "All Games" as first option
    gameSelect.innerHTML = '<option value="">All Games</option>';
    
    availableGames.forEach(game => {
        const option = document.createElement('option');
        option.value = game;
        option.textContent = game;
        gameSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('applyFilters').addEventListener('click', loadRankings);
    
    // Allow Enter key to apply filters
    document.getElementById('startDate').addEventListener('keypress', handleEnterKey);
    document.getElementById('endDate').addEventListener('keypress', handleEnterKey);
    document.getElementById('gameSelect').addEventListener('keypress', handleEnterKey);
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        loadRankings();
    }
}

// Load rankings based on selected filters
async function loadRankings() {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const game = document.getElementById('gameSelect').value;
        
        const baseUrl = window.location.pathname.includes('/random') ? '/random' : '';
        const params = new URLSearchParams();
        
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        if (game) params.append('game', game);
        
        const response = await fetch(`${baseUrl}/ranks/custom-range?${params}`);
        const data = await response.json();
        
        if (data.success) {
            displayRankings(data.data, data.dateRange);
        }
    } catch (error) {
        console.error('Error loading rankings:', error);
        displayError('Failed to load rankings. Please try again.');
    }
}

// Display rankings
function displayRankings(rankings, dateRange) {
    const tbody = document.getElementById('rankingsTableBody');
    const dateRangeDisplay = document.getElementById('dateRangeDisplay');
    
    // Display date range
    if (dateRange && typeof dateRange === 'object') {
        const startDate = formatDisplayDate(dateRange.start);
        const endDate = formatDisplayDate(dateRange.end);
        const gameText = dateRange.game;
    } else {
        dateRangeDisplay.innerHTML = dateRange || 'No date range specified';
    }
    
    // Clear table
    tbody.innerHTML = '';
    
    if (rankings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No data available for the selected filters</td></tr>';
        return;
    }
    
    // Populate table
    rankings.forEach((player, index) => {
        const row = tbody.insertRow();
        row.className = index < 3 ? 'highlight-row' : '';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.totalScore}</td>
            <td>${player.gamesPlayed}/${player.totalGames}</td>
        `;
    });
}

// Format date for display
function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Display error message
function displayError(message) {
    const tbody = document.getElementById('rankingsTableBody');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #f44336;">${message}</td></tr>`;
}