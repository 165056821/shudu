class SudokuGame {
    constructor() {
        this.currentMode = 'kid4';
        this.board = [];
        this.solution = [];
        this.fixed = [];
        this.selectedCell = null;
        this.startTime = null;
        this.timer = null;
        this.score = 0;
        this.hints = 3;
        this.isMuted = false;
        this.volume = 0.5;
        
        this.encouragingMessages = [
            "太棒了！继续加油！",
            "你真聪明！",
            "做得真好！",
            "哇，好厉害！",
            "你是数独小天才！",
            "爸爸妈妈为你骄傲！",
            "继续思考，你一定行！",
            "这个答案真不错！"
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.newGame();
    }

    getGridSize() {
        switch(this.currentMode) {
            case 'kid4': return 4;
            case 'kid6': return 6;
            case 'normal9': return 9;
            default: return 4;
        }
    }

    createBoard() {
        const board = document.getElementById('sudoku-board');
        board.innerHTML = '';
        
        const size = this.getGridSize();
        board.className = `sudoku-board ${this.currentMode}`;
        
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.selectCell(i));
            board.appendChild(cell);
        }
    }

    createNumberPad() {
        const numberPad = document.getElementById('number-pad');
        numberPad.innerHTML = '';
        
        const size = this.getGridSize();
        numberPad.className = `number-pad ${this.currentMode}`;
        
        for (let i = 1; i <= size; i++) {
            const btn = document.createElement('button');
            btn.className = 'number-btn';
            btn.dataset.num = i;
            btn.textContent = i;
            btn.addEventListener('click', () => this.inputNumber(i));
            numberPad.appendChild(btn);
        }
        
        const eraseBtn = document.createElement('button');
        eraseBtn.className = 'number-btn erase';
        eraseBtn.dataset.num = 0;
        eraseBtn.textContent = '❌';
        eraseBtn.addEventListener('click', () => this.inputNumber(0));
        numberPad.appendChild(eraseBtn);
    }

    bindEvents() {
        document.getElementById('new-game').addEventListener('click', () => {
            this.playSound('click');
            this.newGame();
        });
        document.getElementById('check').addEventListener('click', () => {
            this.playSound('click');
            this.checkSolution();
        });
        document.getElementById('hint').addEventListener('click', () => {
            this.playSound('hint');
            this.showHint();
        });
        document.getElementById('celebrate').addEventListener('click', () => {
            this.playSound('celebrate');
            this.celebrateWin();
        });
        document.getElementById('mode').addEventListener('change', (e) => {
            this.playSound('click');
            this.currentMode = e.target.value;
            this.newGame();
        });

        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
        document.getElementById('volumeSlider').addEventListener('input', (e) => this.setVolume(e.target.value));

        document.addEventListener('keydown', (e) => {
            if (this.selectedCell !== null) {
                const size = this.getGridSize();
                if (e.key >= '1' && e.key <= String(size)) {
                    this.inputNumber(parseInt(e.key));
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    this.inputNumber(0);
                }
            }
        });

        this.setupAudioContext();
    }

    setupAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this.sounds = {
            click: this.createTone(800, 0.1, 'sine'),
            correct: this.createTone(1200, 0.15, 'triangle'),
            wrong: this.createTone(300, 0.2, 'square'),
            celebrate: this.createTone(1200, 0.5, 'sine'),
            hint: this.createTone(600, 0.3, 'sine'),
            win: this.createMelody()
        };
    }

    createTone(frequency, duration, type) {
        return () => {
            if (this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    createMelody() {
        return () => {
            if (this.isMuted) return;
            
            const notes = [523, 659, 784, 1047]; // C, E, G, C
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(this.volume * 0.05, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 150);
            });
        };
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const muteBtn = document.getElementById('muteBtn');
        muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
        this.playSound('click');
    }

    setVolume(value) {
        this.volume = value / 100;
        this.playSound('click');
    }

    newGame() {
        this.createBoard();
        this.createNumberPad();
        this.generatePuzzle();
        this.renderBoard();
        this.startTimer();
        this.showMessage('选择一个小格子开始游戏吧！');
        this.hints = 3;
        this.updateScore();
    }

    generatePuzzle() {
        const size = this.getGridSize();
        this.solution = this.generateSolution(size);
        this.board = this.solution.map(row => [...row]);
        
        const totalCells = size * size;
        const cellsToRemove = Math.floor(totalCells * 0.4);
        
        const indices = Array.from({length: totalCells}, (_, i) => i);
        const shuffled = this.shuffleArray(indices);
        
        for (let i = 0; i < cellsToRemove; i++) {
            const index = shuffled[i];
            const row = Math.floor(index / size);
            const col = index % size;
            this.board[row][col] = 0;
        }

        this.fixed = this.board.map(row => row.map(cell => cell !== 0));
    }

    generateSolution(size) {
        const grid = Array(size).fill().map(() => Array(size).fill(0));
        const numbers = Array.from({length: size}, (_, i) => i + 1);
        
        this.solveSudoku(grid, size, numbers);
        return grid;
    }

    solveSudoku(grid, size, numbers) {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (grid[row][col] === 0) {
                    const shuffledNumbers = this.shuffleArray([...numbers]);
                    for (let num of shuffledNumbers) {
                        if (this.isValidMove(grid, row, col, num, size)) {
                            grid[row][col] = num;
                            if (this.solveSudoku(grid, size, numbers)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValidMove(grid, row, col, num, size) {
        for (let i = 0; i < size; i++) {
            if (grid[row][i] === num || grid[i][col] === num) {
                return false;
            }
        }

        if (size === 4) {
            const boxRow = Math.floor(row / 2) * 2;
            const boxCol = Math.floor(col / 2) * 2;
            for (let i = boxRow; i < boxRow + 2; i++) {
                for (let j = boxCol; j < boxCol + 2; j++) {
                    if (grid[i][j] === num) {
                        return false;
                    }
                }
            }
        } else if (size === 6) {
            const boxRow = Math.floor(row / 2) * 2;
            const boxCol = Math.floor(col / 3) * 3;
            for (let i = boxRow; i < boxRow + 2; i++) {
                for (let j = boxCol; j < Math.min(boxCol + 3, size); j++) {
                    if (grid[i][j] === num) {
                        return false;
                    }
                }
            }
        } else {
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let i = boxRow; i < boxRow + 3; i++) {
                for (let j = boxCol; j < boxCol + 3; j++) {
                    if (grid[i][j] === num) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    isValidMoveForCell(row, col, num) {
        const size = this.getGridSize();
        
        // Check if the number is the same as the solution
        return num === this.solution[row][col];
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    renderBoard() {
        const cells = document.querySelectorAll('.cell');
        const size = this.getGridSize();
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / size);
            const col = index % size;
            const value = this.board[row][col];
            
            cell.textContent = value || '';
            cell.className = 'cell';
            
            if (value) {
                cell.classList.add(`number-${value}`);
            }
            
            if (this.fixed[row][col]) {
                cell.classList.add('fixed');
            }
        });
        
        this.updateProgress();
    }

    selectCell(index) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.remove('selected'));
        
        const size = this.getGridSize();
        const row = Math.floor(index / size);
        const col = index % size;
        
        if (!this.fixed[row][col]) {
            this.selectedCell = index;
            cells[index].classList.add('selected');
        }
    }

    inputNumber(num) {
        if (this.selectedCell === null) return;
        
        const size = this.getGridSize();
        const row = Math.floor(this.selectedCell / size);
        const col = this.selectedCell % size;
        
        if (!this.fixed[row][col]) {
            const oldValue = this.board[row][col];
            this.board[row][col] = num;
            
            // Real-time validation
            if (num !== 0) {
                const isCorrect = this.isValidMoveForCell(row, col, num);
                if (isCorrect) {
                    this.playSound('correct');
                    this.score += 10;
                    this.showMessage(this.encouragingMessages[Math.floor(Math.random() * this.encouragingMessages.length)]);
                    
                    // Add correct visual feedback
                    const cell = document.querySelectorAll('.cell')[this.selectedCell];
                    cell.classList.add('correct');
                    setTimeout(() => cell.classList.remove('correct'), 600);
                } else {
                    this.playSound('wrong');
                    this.score = Math.max(0, this.score - 5);
                    this.showMessage('再想想看，这个数字不合适哦！');
                    
                    // Add wrong visual feedback
                    const cell = document.querySelectorAll('.cell')[this.selectedCell];
                    cell.classList.add('wrong');
                    setTimeout(() => cell.classList.remove('wrong'), 500);
                }
            } else {
                this.playSound('click');
                if (oldValue !== 0) {
                    this.score = Math.max(0, this.score - 5);
                }
            }
            
            this.renderBoard();
            this.selectCell(this.selectedCell);
            this.updateScore();
            
            if (this.isBoardComplete()) {
                this.checkSolution();
            }
        }
    }

    isBoardComplete() {
        const size = this.getGridSize();
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    checkSolution() {
        const size = this.getGridSize();
        let isCorrect = true;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this.board[row][col] !== this.solution[row][col]) {
                    isCorrect = false;
                    break;
                }
            }
            if (!isCorrect) break;
        }

        if (isCorrect) {
            this.stopTimer();
            this.celebrateWin();
            this.showMessage('🎉 你真棒！成功完成数独啦！');
        } else {
            this.showMessage('🤔 还有错误哦，再试试看！');
        }
    }

    showHint() {
        if (this.hints <= 0) {
            this.showMessage('💡 没有提示了，再想想吧！');
            return;
        }

        const size = this.getGridSize();
        const emptyCells = [];
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({row, col});
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[randomCell.row][randomCell.col] = this.solution[randomCell.row][randomCell.col];
            this.renderBoard();
            this.hints--;
            this.showMessage('💡 给你一个提示！');
        }
    }

    celebrateWin() {
        const celebration = document.getElementById('celebration');
        celebration.classList.add('show');
        
        this.playSound('win');
        this.createStars();
        
        setTimeout(() => {
            celebration.classList.remove('show');
        }, 3000);
    }

    createStars() {
        const starsContainer = document.getElementById('stars');
        starsContainer.innerHTML = '';
        
        const stars = ['⭐', '✨', '🌟', '💫', '🎉', '🎊'];
        
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.textContent = stars[Math.floor(Math.random() * stars.length)];
            star.style.left = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 2 + 's';
            star.style.animationDuration = (Math.random() * 2 + 2) + 's';
            starsContainer.appendChild(star);
        }
        
        setTimeout(() => {
            starsContainer.innerHTML = '';
        }, 4000);
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateProgress() {
        const size = this.getGridSize();
        const totalCells = size * size;
        const filledCells = this.board.flat().filter(cell => cell !== 0).length;
        const progress = (filledCells / totalCells) * 100;
        
        document.getElementById('progress').style.width = progress + '%';
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    showMessage(msg) {
        document.getElementById('message').textContent = msg;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});