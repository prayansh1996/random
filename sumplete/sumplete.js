const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Sumplete Solver</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 10px;
            box-sizing: border-box;
        }
        h1 {
            font-size: clamp(1.5em, 5vw, 3em);
            color: #4a90e2;
            margin: 10px 0 20px 0;
            text-align: center;
        }
        .grid-container {
            display: grid;
            grid-template-columns: repeat(8, minmax(35px, 1fr));
            grid-template-rows: repeat(8, minmax(35px, 1fr));
            gap: 3px;
            max-width: 90vw;
            max-height: 70vh;
            aspect-ratio: 1;
        }
        .grid-item {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        .input-field {
            width: 100%;
            height: 100%;
            text-align: center;
            font-size: clamp(12px, 3vw, 16px);
            border: none;
            border-radius: 3px;
            box-sizing: border-box;
            padding: 0;
            -webkit-appearance: none;
            -moz-appearance: textfield;
        }
        .input-field::-webkit-outer-spin-button,
        .input-field::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .input-field:focus {
            outline: 2px solid #4a90e2;
            outline-offset: -2px;
        }
        .total-field {
            background-color: #f0f0f0;
            color: #666;
        }
        .solve-button {
            margin-top: 20px;
            padding: 12px 24px;
            font-size: clamp(14px, 4vw, 18px);
            background-color: #4a90e2;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            min-height: 44px;
            min-width: 120px;
            touch-action: manipulation;
        }
        .solve-button:hover {
            background-color: #357abd;
        }
        .solve-button:active {
            transform: scale(0.98);
        }
        .solution-container {
            margin-top: 30px;
            text-align: center;
            max-width: 90vw;
        }
        .solution-title {
            font-size: clamp(18px, 4vw, 24px);
            color: #4a90e2;
            margin-bottom: 15px;
        }
        .solution-grid {
            display: grid;
            grid-template-columns: repeat(7, minmax(30px, 1fr));
            grid-template-rows: repeat(7, minmax(30px, 1fr));
            gap: 2px;
            justify-content: center;
            margin: 0 auto;
            max-width: 80vw;
            aspect-ratio: 1;
        }
        .solution-cell {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: white;
            border: 1px solid #ccc;
            font-size: clamp(10px, 2.5vw, 14px);
            font-weight: bold;
            border-radius: 2px;
        }
        .solution-cell.selected {
            background-color: #e24a4a;
            color: white;
        }
        .no-solution {
            font-size: clamp(16px, 4vw, 20px);
            color: #e74c3c;
            font-weight: bold;
        }
        
        /* Tablet and larger screens */
        @media (min-width: 768px) {
            body {
                justify-content: center;
                padding: 20px;
            }
            .grid-container {
                grid-template-columns: repeat(8, 50px);
                grid-template-rows: repeat(8, 50px);
                gap: 5px;
                max-width: none;
                max-height: none;
            }
            .input-field {
                font-size: 16px;
            }
            .solution-grid {
                grid-template-columns: repeat(7, 40px);
                grid-template-rows: repeat(7, 40px);
                gap: 3px;
                max-width: none;
            }
            .solution-cell {
                font-size: 14px;
            }
        }
        
        /* Prevent zoom on iOS */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
            select, textarea, input[type="text"], input[type="password"], 
            input[type="datetime"], input[type="datetime-local"], 
            input[type="date"], input[type="month"], input[type="time"], 
            input[type="week"], input[type="number"], input[type="email"], 
            input[type="url"], input[type="search"], input[type="tel"], 
            input[type="color"] {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <h1>Sumplete Solver</h1>
    <div class="grid-container">
        <!-- Row 1 -->
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="9">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="4">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="4">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="8">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="7">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="5">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="3">
        <input type="number" class="grid-item input-field total-field row-total" min="0" max="99" step="1" value="33">
        
        <!-- Row 2 -->
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="2">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="2">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="8">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="4">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="7">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="7">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="5">
        <input type="number" class="grid-item input-field total-field row-total" min="0" max="99" step="1" value="28">
        
        <!-- Row 3 -->
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="3">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="4">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="7">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="3">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="4">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="1">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="1">
        <input type="number" class="grid-item input-field total-field row-total" min="0" max="99" step="1" value="8">
        
        <!-- Row 4 -->
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="6">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="6">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="4">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="8">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="3">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="8">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="1">
        <input type="number" class="grid-item input-field total-field row-total" min="0" max="99" step="1" value="20">
        
        <!-- Row 5 -->
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="4">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="2">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="2">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="5">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="9">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="7">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="3">
        <input type="number" class="grid-item input-field total-field row-total" min="0" max="99" step="1" value="21">
        
        <!-- Row 6 -->
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="9">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="7">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="5">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="9">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="8">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="5">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="4">
        <input type="number" class="grid-item input-field total-field row-total" min="0" max="99" step="1" value="33">
        
        <!-- Row 7 -->
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="1">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="6">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="5">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="6">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="9">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="6">
        <input type="number" class="grid-item input-field grid-cell" min="0" max="9" step="1" value="3">
        <input type="number" class="grid-item input-field total-field row-total" min="0" max="99" step="1" value="21">
        
        <!-- Column totals row -->
        <input type="number" class="grid-item input-field total-field col-total" min="0" max="99" step="1" value="27">
        <input type="number" class="grid-item input-field total-field col-total" min="0" max="99" step="1" value="19">
        <input type="number" class="grid-item input-field total-field col-total" min="0" max="99" step="1" value="21">
        <input type="number" class="grid-item input-field total-field col-total" min="0" max="99" step="1" value="21">
        <input type="number" class="grid-item input-field total-field col-total" min="0" max="99" step="1" value="43">
        <input type="number" class="grid-item input-field total-field col-total" min="0" max="99" step="1" value="24">
        <input type="number" class="grid-item input-field total-field col-total" min="0" max="99" step="1" value="9">
    </div>
    
    <button class="solve-button" onclick="copyGridToClipboard()">Solve</button>

    <div class="solution-container" id="solutionContainer" style="display: none;">
        <div class="solution-title">Solution:</div>
        <div id="solutionContent"></div>
    </div>

    <script>
        function copyGridToClipboard() {
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
            
            // Send to server to solve
            fetch('/sumplete/solve', {
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
                const solutionNumbers = output.trim().split(/\\s+/);
                
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
                    solutionHTML += \`<div class="\${cellClass}">\${originalValue}</div>\`;
                }
                solutionHTML += '</div>';
                
                solutionContent.innerHTML = solutionHTML;
            }
        }
    </script>
</body>
</html>`);
});

module.exports = router;