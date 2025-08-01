// Function to calculate weekly ranks
async function calculateRanks() {
    const input = document.getElementById('leaderboardInput').value;
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    const button = document.getElementById('calculateBtn');
    
    // Reset displays
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (!input.trim()) {
        errorDiv.textContent = 'Please paste your leaderboard data';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Disable button during processing
    button.disabled = true;
    button.textContent = 'Calculating...';
    
    try {
        // Determine the base URL from the current page
        const baseUrl = window.location.pathname.includes('/random') ? '/random' : '';
        
        const response = await fetch(`${baseUrl}/ranks/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: input
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data);
        } else {
            throw new Error(data.error || 'Failed to calculate ranks');
        }
    } catch (error) {
        errorDiv.textContent = 'Error: ' + error.message;
        errorDiv.style.display = 'block';
    } finally {
        // Re-enable button
        button.disabled = false;
        button.textContent = 'Calculate Weekly Ranks';
    }
}

// Function to display results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const summaryDiv = document.getElementById('summary');
    const tbody = document.getElementById('rankingsBody');
    
    // Clear previous results
    tbody.innerHTML = '';
    
    // Display summary
    summaryDiv.innerHTML = `
        <p><strong>Days Processed:</strong> ${data.daysProcessed}</p>
        <p><strong>Total Players:</strong> ${data.totalPlayers}</p>
    `;
    
    // Display rankings
    data.weeklyRanks.forEach((player, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.totalRank}</td>
        `;
        
        // Highlight top 3
        if (index < 3) {
            row.classList.add('top-rank');
        }
    });
    
    resultsDiv.style.display = 'block';
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Function to submit immunity pass data
async function submitImmunityPass() {
    const input = document.getElementById('immunityInput').value;
    const resultsDiv = document.getElementById('immunityResults');
    const messageDiv = document.getElementById('immunityMessage');
    const button = document.getElementById('submitImmunityBtn');
    const errorDiv = document.getElementById('error');
    
    // Reset displays
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (!input.trim()) {
        errorDiv.textContent = 'Please enter immunity pass data';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Disable button during processing
    button.disabled = true;
    button.textContent = 'Submitting...';
    
    try {
        // Determine the base URL from the current page
        const baseUrl = window.location.pathname.includes('/random') ? '/random' : '';
        
        const response = await fetch(`${baseUrl}/ranks/immunity-pass`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: input })
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageDiv.textContent = `Successfully updated immunity pass points. Processed ${data.entriesProcessed} entries.`;
            resultsDiv.style.display = 'block';
            
            // Clear the input
            document.getElementById('immunityInput').value = '';
            
            // Hide message after 5 seconds
            setTimeout(() => {
                resultsDiv.style.display = 'none';
            }, 5000);
        } else {
            throw new Error(data.error || 'Failed to submit immunity pass data');
        }
    } catch (error) {
        errorDiv.textContent = 'Error: ' + error.message;
        errorDiv.style.display = 'block';
    } finally {
        // Re-enable button
        button.disabled = false;
        button.textContent = 'Submit Immunity Pass Points';
    }
}

// Handle Enter key in textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('leaderboardInput');
    if (textarea) {
        textarea.addEventListener('keydown', function(e) {
            // Allow Ctrl+Enter or Cmd+Enter to submit
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                calculateRanks();
            }
        });
    }
    
    const immunityTextarea = document.getElementById('immunityInput');
    if (immunityTextarea) {
        immunityTextarea.addEventListener('keydown', function(e) {
            // Allow Ctrl+Enter or Cmd+Enter to submit
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                submitImmunityPass();
            }
        });
    }
});