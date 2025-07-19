# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A kid-friendly Sudoku game web application featuring three difficulty levels (4x4, 6x6, 9x9) with colorful UI, sound effects, and encouragement messages designed for children.

## Communication Guidelines

- 必须使用中文回复我

## Architecture

**Single-Page Application (SPA)** built with vanilla JavaScript, HTML, and CSS:
- **index.html**: Main page structure with game controls and placeholders
- **script.js**: Core `SudokuGame` class managing game logic, state, and interactions
- **style.css**: Kid-friendly styling with animations and responsive design

## Key Components

### Game Logic (`script.js:1-539`)
- **SudokuGame Class**: Central game controller with methods for:
  - Puzzle generation using backtracking algorithm
  - Real-time validation and feedback
  - Audio system with Web Audio API
  - Score tracking and timer
  - Hint system (3 hints per game)

### Game Modes
- **kid4**: 4x4 grid with 2x2 subgrids
- **kid6**: 6x6 grid with 2x3 subgrids  
- **normal9**: Standard 9x9 grid with 3x3 subgrids

### Audio System (`script.js:123-199`)
- Web Audio API for dynamic sound generation
- Volume control and mute functionality
- Different tones for correct/incorrect inputs, celebrations

### Responsive Design (`style.css:437-485`)
- Mobile-first responsive layout
- Adaptive grid sizing based on game mode
- Touch-friendly controls for tablets/phones

## Development Commands

Since this is a static web application, use these commands for development:

**Local Development:**
```bash
# Serve locally (requires Python)
python -m http.server 8000
# or
python3 -m http.server 8000

# Serve locally (requires Node.js)
npx serve .
```

**Testing:**
- Open browser to `http://localhost:8000`
- Test all three game modes
- Verify responsive design on different screen sizes
- Test audio functionality and volume controls

**Code Quality:**
```bash
# Validate HTML
npx html-validate index.html

# Check CSS
npx stylelint style.css

# JavaScript linting
npx eslint script.js
```

## File Structure

```
├── index.html          # Main HTML structure
├── script.js           # Game logic and SudokuGame class
├── style.css           # Styling and animations
└── CLAUDE.md          # This file
```

## Key Classes and Methods

### SudokuGame Class
- `generateSolution(size)`: Creates valid Sudoku solution
- `generatePuzzle()`: Generates puzzle by removing cells from solution
- `isValidMove(grid, row, col, num, size)`: Validates Sudoku rules
- `createBoard()`: Dynamically creates grid based on game mode
- `createNumberPad()`: Generates number input buttons
- `celebrateWin()`: Triggers celebration animation and sounds

### CSS Grid Systems
- Dynamic grid sizing: `.sudoku-board.kid4`, `.kid6`, `.normal9`
- Number pad layouts: `.number-pad.kid4`, `.kid6`, `.kid9`

## Browser Compatibility

- Modern browsers with Web Audio API support
- Responsive design for mobile/tablet/desktop
- Uses CSS Grid and Flexbox for layout
- ES6+ JavaScript features (classes, arrow functions)