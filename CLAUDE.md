# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `cd random && npm start` - Start the Express server on port 3000
- `cd random && npm dev` - Same as start (runs on port 3000)

### Building the C++ Solver
The Sumplete solver binary needs to be compiled from source:
```bash
g++ -o sumplete_solver.out sumplete_solver.cpp
```

### Testing
No test framework is currently configured. The test script exits with an error.

## Architecture

This is a Node.js/Express web application with multiple utility features:

### Directory Structure
- `/random/` - Main application directory
  - `index.js` - Express server entry point, handles routing and solver integration
  - `sumplete.js` - Sumplete puzzle route handler
  - `ranks.js` - Ranks feature route handler
  - `/views/` - EJS templates for server-side rendering
  - `/public/` - Static assets (CSS and client-side JS)
- `sumplete_solver.cpp` - C++ source for puzzle solving algorithm
- `sumplete_solver.out` - Compiled binary called by the Express app

### Key Components

1. **Express Server** (index.js)
   - Runs on port 3000 (or PORT env variable)
   - Uses EJS templating engine
   - Modular routing with separate route files
   - Integrates with C++ binary via child_process.spawn()

2. **Sumplete Puzzle Solver**
   - Web interface at `/sumplete`
   - POST endpoint `/sumplete/solve` accepts puzzle input
   - Spawns C++ binary with input format: "7 [puzzle_data]"
   - Returns JSON response with solution or error

3. **Ranks Feature**
   - Accessible at `/ranks`
   - Weekly leaderboard calculator for game rankings
   - POST endpoint `/ranks/calculate` accepts multiline leaderboard data
   - Parses daily rankings and calculates weekly totals
   - Handles missing players by assigning them rank = (number of players + 1)

### External Dependencies
The app calls a compiled C++ binary at `/home/ec2-user/projects/webdev/random/sumplete_solver.out` for solving Sumplete puzzles. Ensure this path is correct when deploying.