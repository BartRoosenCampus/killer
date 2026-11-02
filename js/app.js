const App = (() => {
    let state = {
        players: [],
        turnOrder: [],
        activePlayerIndex: 0,
        currentMultiplier: 1,
        currentTurnThrows: [],
        gameStarted: false,
        gameOver: false
    };

    function init() {
        const saved = localStorage.getItem('dart_killer_state');
        if (saved) {
            state = JSON.parse(saved);
            if (state.gameStarted) {
                showScreen('screen-game');
                renderGame();
                buildNumberKeypad();
                return;
            }
        }
        showScreen('screen-names');
        renderPlayerInputList();
    }

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    function addPlayer() {
        const input = document.getElementById('new-player-input');
        const name = input.value.trim();

        if (!name) return;
        if (state.players.length >= 10) {
            alert('Je kunt maximaal 10 spelers toevoegen.');
            return;
        }

        state.players.push({
            name: name,
            number: null,
            score: 0,
            isEliminated: false
        });

        input.value = '';
        renderPlayerInputList();
        input.focus();
    }

    function removePlayer(index) {
        state.players.splice(index, 1);
        renderPlayerInputList();
    }

    function renderPlayerInputList() {
        const container = document.getElementById('player-list-container');
        container.innerHTML = '';

        document.getElementById('player-count-label').innerText = state.players.length;

        state.players.forEach((p, index) => {
            const item = document.createElement('div');
            item.className = 'player-name-item';
            item.innerHTML = `
                <span>${index + 1}. ${p.name}</span>
                <button onclick="App.removePlayer(${index})">Verwijder</button>
            `;
            container.appendChild(item);
        });

        const startBtn = document.getElementById('start-game-btn');
        if (state.players.length >= 2) {
            startBtn.disabled = false;
            startBtn.innerText = `Start Spel (${state.players.length} spelers)`;
        } else {
            startBtn.disabled = true;
            startBtn.innerText = `Start Spel (nog min. ${2 - state.players.length} nodig)`;
        }
    }

    function startGame() {
        if (state.players.length < 2) return;

        let availableNumbers = [];
        for (let i = 1; i <= 20; i++) availableNumbers.push(i);

        availableNumbers.sort(() => Math.random() - 0.5);

        state.players.forEach((p, index) => {
            p.number = availableNumbers[index];
            p.score = 0;
            p.isEliminated = false;
        });

        let shuffledOrder = [...state.players];
        shuffledOrder.sort(() => Math.random() - 0.5);
        state.turnOrder = shuffledOrder;

        state.activePlayerIndex = 0;
        state.currentTurnThrows = [];
        state.gameStarted = true;
        state.gameOver = false;

        saveState();
        showScreen('screen-game');
        renderGame();
        buildNumberKeypad();
    }

    function renderGame() {
        const activePlayer = state.turnOrder[state.activePlayerIndex];

        if (state.gameOver) {
            document.getElementById('game-status-title').innerText = "🏆 Spel afgelopen!";
            document.getElementById('active-player-name').innerText = "Winnaar bekend!";
        } else {
            document.getElementById('game-status-title').innerText = "Killer Spel";
            document.getElementById('active-player-name').innerText = activePlayer ? `${activePlayer.name} (Zijn nummer is ${activePlayer.number})` : '-';
        }

        document.getElementById('modal-active-player-title').innerText = activePlayer ? `Beurt: ${activePlayer.name} (Nr: ${activePlayer.number})` : 'Beurt';

        const grid = document.getElementById('players-grid');
        grid.innerHTML = '';

        state.turnOrder.forEach((player, index) => {
            const isActive = (!state.gameOver && index === state.activePlayerIndex && !player.isEliminated);
            const isKiller = player.score >= 5;
            const dotClass = isKiller ? 'red-dot' : 'green-dot';

            let dotsHtml = '';
            for (let i = 1; i <= 5; i++) {
                const filled = i <= player.score ? dotClass : '';
                dotsHtml += `<div class="dot ${filled}"></div>`;
            }

            const tile = document.createElement('div');
            const isWinner = state.gameOver && !player.isEliminated;

            tile.className = `player-tile ${isActive ? 'active-turn' : ''} ${player.isEliminated ? 'eliminated' : ''} ${isWinner ? 'winner-tile' : ''}`;
            tile.innerHTML = `
                <div class="tile-header">
                    <span>${player.name} (Nr: ${player.number})</span>
                    <span class="tile-info-right">${isWinner ? '👑 WINNAAR' : (isKiller ? '🔥 KILLER' : `Score: ${player.score}/5`)}</span>
                </div>
                <div class="dots-container">
                    ${dotsHtml}
                </div>
            `;
            grid.appendChild(tile);
        });

        // Knoppen wisselen bij winst
        const mobileControls = document.getElementById('mobile-action-controls');
        const winControls = document.getElementById('win-action-controls');
        const scorePanel = document.getElementById('score-input-panel');

        if (state.gameOver) {
            if (mobileControls) mobileControls.style.display = 'none';
            if (winControls) winControls.style.display = 'flex';
            if (scorePanel) scorePanel.style.display = 'none'; // Verberg klavier bij winst
        } else {
            if (winControls) winControls.style.display = 'none';
            if (mobileControls) mobileControls.style.display = 'flex';
            if (scorePanel && window.innerWidth >= 768) scorePanel.style.display = 'flex';
        }

        checkWinCondition();
    }

    function openScoreModal() {
        if (state.gameOver) return;
        state.currentTurnThrows = [];
        updateThrowsPreview();
        document.getElementById('score-input-panel').classList.add('modal-active');
    }

    function closeScoreModal() {
        document.getElementById('score-input-panel').classList.remove('modal-active');
        renderGame();
    }

    function setMultiplier(mult) {
        state.currentMultiplier = mult;
        document.querySelectorAll('.mult-btn').forEach(btn => btn.classList.remove('active'));
        if (mult === 1) document.getElementById('btn-single').classList.add('active');
        if (mult === 2) document.getElementById('btn-double').classList.add('active');
        if (mult === 3) document.getElementById('btn-triple').classList.add('active');
    }

    function buildNumberKeypad() {
        const keypad = document.getElementById('number-keypad');
        keypad.innerHTML = '';

        for (let i = 1; i <= 20; i++) {
            const btn = document.createElement('button');
            btn.className = 'num-btn';
            btn.innerText = i;
            btn.onclick = () => recordThrow(i, i.toString());
            keypad.appendChild(btn);
        }

        const bullBtn = document.createElement('button');
        bullBtn.className = 'num-btn special-btn';
        bullBtn.innerText = 'BULL';
        bullBtn.onclick = () => recordThrow('BULL', 'BULL');
        keypad.appendChild(bullBtn);

        const missBtn = document.createElement('button');
        missBtn.className = 'num-btn special-btn';
        missBtn.innerText = 'MIS';
        missBtn.onclick = () => recordThrow('MIS', 'MIS');
        keypad.appendChild(missBtn);
    }

    function recordThrow(target, labelName) {
        if (state.gameOver) return;

        const mult = state.currentMultiplier;
        let prefix = '';
        if (mult === 2) prefix = 'D';
        if (mult === 3) prefix = 'T';
        if (mult === 1 && target !== 'MIS' && target !== 'BULL') prefix = 'S';

        let formattedLabel = target === 'MIS' ? 'MIS' : `${prefix}${labelName}`;

        state.currentTurnThrows.push({
            target: target,
            multiplier: mult,
            label: formattedLabel
        });

        updateThrowsPreview();
        processThrow(target, mult);
        renderGame();

        setMultiplier(1);

        if (state.currentTurnThrows.length >= 3) {
            setTimeout(() => {
                if (window.innerWidth < 768) {
                    closeScoreModal();
                }
                if (!state.gameOver) {
                    advanceTurn();
                }
            }, 400);
        } else {
            document.getElementById('dart-turn-counter').innerText = `Pijl ${state.currentTurnThrows.length + 1} van 3`;
        }
    }

    function updateThrowsPreview() {
        for (let i = 0; i < 3; i++) {
            const tile = document.getElementById(`throw-${i}`);
            if (state.currentTurnThrows[i]) {
                tile.innerText = state.currentTurnThrows[i].label;
                tile.style.borderColor = '#81c784';
            } else {
                tile.innerText = '-';
                tile.style.borderColor = 'var(--border-color)';
            }
        }
        document.getElementById('dart-turn-counter').innerText = `Pijl ${state.currentTurnThrows.length + 1} van 3`;
    }

    function processThrow(target, hits) {
        if (target === 'MIS' || target === 'BULL') return;

        const activePlayer = state.turnOrder[state.activePlayerIndex];
        const targetPlayer = state.turnOrder.find(p => p.number === target);

        if (targetPlayer && !targetPlayer.isEliminated) {
            if (targetPlayer === activePlayer) {
                if (targetPlayer.score < 5) {
                    targetPlayer.score += hits;
                    if (targetPlayer.score > 5) targetPlayer.score = 5;
                }
            } else {
                if (activePlayer.score >= 5) {
                    targetPlayer.score -= hits;
                    if (targetPlayer.score < 0) targetPlayer.score = 0;

                    if (targetPlayer.score === 0) {
                        targetPlayer.isEliminated = true;
                    }
                } else {
                    targetPlayer.score += hits;
                    if (targetPlayer.score > 5) targetPlayer.score = 5;
                }
            }
        }
    }

    function advanceTurn() {
        let attempts = 0;
        do {
            state.activePlayerIndex = (state.activePlayerIndex + 1) % state.turnOrder.length;
            attempts++;
        } while (state.turnOrder[state.activePlayerIndex].isEliminated && attempts < state.turnOrder.length);

        state.currentTurnThrows = [];
        updateThrowsPreview();
        saveState();
        renderGame();
    }

    function checkWinCondition() {
        const activePlayers = state.turnOrder.filter(p => !p.isEliminated);
        if (activePlayers.length === 1 && state.gameStarted && !state.gameOver) {
            state.gameOver = true;
            saveState();
        }
    }

    function confirmResetGame() {
        document.getElementById('reset-modal').style.display = 'flex';
    }

    function closeResetModal() {
        document.getElementById('reset-modal').style.display = 'none';
    }

    function executeResetGame() {
        closeResetModal();
        localStorage.removeItem('dart_killer_state');
        state = {
            players: [],
            turnOrder: [],
            activePlayerIndex: 0,
            currentMultiplier: 1,
            currentTurnThrows: [],
            gameStarted: false,
            gameOver: false
        };
        showScreen('screen-names');
        renderPlayerInputList();
    }

    function saveState() {
        localStorage.setItem('dart_killer_state', JSON.stringify(state));
    }

    return {
        init,
        addPlayer,
        removePlayer,
        startGame,
        openScoreModal,
        closeScoreModal,
        setMultiplier,
        confirmResetGame,
        closeResetModal,
        executeResetGame,
        showScreen
    };
})();

window.onload = App.init;