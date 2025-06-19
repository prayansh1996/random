const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import route handlers
const sumpleteRouter = require('./sumplete');
const ranksRouter = require('./ranks');

// Middleware to parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    // Log incoming request
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    console.log(`  User-Agent: ${userAgent}`);
    
    // Log request body for POST requests
    if (method === 'POST' && req.body) {
        const bodyPreview = JSON.stringify(req.body);
        if (bodyPreview.length > 200) {
            console.log(`  Request body: ${bodyPreview.substring(0, 200)}...`);
        } else {
            console.log(`  Request body: ${bodyPreview}`);
        }
    }
    
    // Capture response details
    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data) {
        res.send = originalSend;
        const duration = Date.now() - startTime;
        console.log(`[${timestamp}] Response: ${res.statusCode} - ${url} (${duration}ms)`);
        return res.send(data);
    };
    
    res.json = function(data) {
        res.json = originalJson;
        const duration = Date.now() - startTime;
        console.log(`[${timestamp}] Response: ${res.statusCode} - ${url} (${duration}ms)`);
        return res.json(data);
    };
    
    next();
});

console.log('Starting server...');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/random', express.static(path.join(__dirname, 'public')));

// Route handlers for both direct access and through reverse proxy
app.use('/sumplete', sumpleteRouter);
app.use('/ranks', ranksRouter);

// Root routes
app.get('/', (req, res) => {
    res.redirect('/sumplete');
});

app.get('/random', (req, res) => {
    res.redirect('/random/sumplete');
});

// Create a function to handle solve requests
const handleSolve = (req, res) => {
    const { input } = req.body;
    
    if (!input) {
        return res.status(400).json({ error: 'No input provided' });
    }

    // Path to the binary
    const binaryPath = path.join('/home/ec2-user/projects/webdev/random/sumplete_solver.out');
    
    // Spawn the binary process
    const solver = spawn(binaryPath);
    
    let output = '';
    let errorOutput = '';
    
    // Collect stdout
    solver.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    // Collect stderr
    solver.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });
    
    // Handle process completion
    solver.on('close', (code) => {
        if (code === 0) {
            res.json({ success: true, output: output.trim() });
        } else {
            res.status(500).json({ 
                success: false, 
                error: `Binary exited with code ${code}`,
                stderr: errorOutput 
            });
        }
    });
    
    // Handle process errors
    solver.on('error', (err) => {
        res.status(500).json({ 
            success: false, 
            error: `Failed to start binary: ${err.message}` 
        });
    });
    
    const bin_input = ['7', input].join(' ');
    console.log(bin_input);

    // Send input to the binary
    solver.stdin.write(bin_input);
    solver.stdin.end();

    console.log(output);
};

// Endpoint to solve the puzzle - both routes
app.post('/sumplete/solve', handleSolve);
app.post('/random/sumplete/solve', handleSolve);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 
