function solvePuzzle() {
    const gridCells = document.querySelectorAll('.grid-cell');
    const rowTotals = document.querySelectorAll('.row-total');
    const colTotals = document.querySelectorAll('.col-total');
    
    let result = [];
    
    // Process each row: 7 grid values + row total
    for (let row = 0; row < 7; row++) {
        // Get 7 values from current row
        for (let col = 0; col < 7; col++) {
            const cellIndex = row * 7 + col;
            const value = gridCells[cellIndex].value || '0';
            result.push(value);
        }
        
        // Add row total
        const rowTotal = rowTotals[row].value || '0';
        result.push(rowTotal);
    }
    
    // Add column totals at the end
    for (let i = 0; i < colTotals.length; i++) {
        const value = colTotals[i].value || '0';
        result.push(value);
    }
    
    // Format as space-separated string
    const gridString = result.join(' ');
    
    // Send to server to solve - use relative path to work with reverse proxy
    // This will work whether accessed as /sumplete or /random/sumplete
    const currentPath = window.location.pathname;
    const basePath = currentPath.includes('/random/') ? '/random/sumplete' : '/sumplete';
    fetch(`${basePath}/solve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: gridString })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySolution(data.output);
        } else {
            displaySolution('-1');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to solve: ' + error.message);
    });
}

function displaySolution(output) {
    const solutionContainer = document.getElementById('solutionContainer');
    const solutionContent = document.getElementById('solutionContent');
    
    solutionContainer.style.display = 'block';
    
    if (output.trim() === '-1') {
        solutionContent.innerHTML = '<div class="no-solution">No solution found</div>';
    } else {
        // Parse the binary solution (49 numbers)
        const solutionNumbers = output.trim().split(/\s+/);
        
        if (solutionNumbers.length !== 49) {
            solutionContent.innerHTML = '<div class="no-solution">Invalid solution format</div>';
            return;
        }
        
        // Get the original grid values for display
        const gridCells = document.querySelectorAll('.grid-cell');
        
        // Create solution grid
        let solutionHTML = '<div class="solution-grid">';
        for (let i = 0; i < 49; i++) {
            const isSelected = solutionNumbers[i] === '0';
            const originalValue = gridCells[i].value || '0';
            const cellClass = isSelected ? 'solution-cell selected' : 'solution-cell';
            solutionHTML += `<div class="${cellClass}">${originalValue}</div>`;
        }
        solutionHTML += '</div>';
        
        solutionContent.innerHTML = solutionHTML;
    }
}