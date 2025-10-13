"use strict";

import {Player} from "./Player.js";

export class Game {
    gameStarted = false;
    list = [];
    page;
    whoseTurn = null;
    numberOfThrows = 0;
    gameOver = false;

    constructor(page) {
        this.page = page;
    }

    addPlayer(player) {
        if (player instanceof Player) {
            player.setId(this.list.length);
            this.list.push(player);
        }
        this.generatePlayersList();
    }

    processScore(player, weight) {
        const currentPlayer = this.list[this.whoseTurn]
        const targetPlayer = player;

        if (weight !== 0) {
            if (currentPlayer.killer && targetPlayer.id !== currentPlayer.id) {
                targetPlayer.decreaseScore(weight);
            } else if (currentPlayer.id === targetPlayer.id) {
                currentPlayer.increaseScore(weight);
            }
        }

        this.switchTurn();
        this.generateGameBoard();
    }

    switchTurn() {
        if (this.isTheGameOver()) {
            this.list[this.whoseTurn].score = 100;
            console.log(this.list[this.whoseTurn]);
            this.gameOver = true;
        } else {
            if (this.numberOfThrows === 2) {
                this.whoseTurn++;

                if (this.whoseTurn === this.list.length) this.whoseTurn = 0;

                const nextPlayer = this.list[this.whoseTurn];

                if (nextPlayer.inPlay === false) {
                    this.switchTurn();
                } else {
                    this.numberOfThrows = 0;
                }
            } else {
                this.numberOfThrows++;
            }
        }
    }

    isTheGameOver() {
        let deadPlayers = 0;
        for (const player of this.list) {
            if (!player.inPlay) deadPlayers++;
            if (deadPlayers === this.list.length - 1) return true;
        }

        return false;
    }

    fillDashboard() {
        this.page.gameDashboard.innerHTML = '';

        const currentPlayer = this.list[this.whoseTurn];

        if (this.gameOver) {
            this.page.gameDashboard.innerHTML = `The winner is ${currentPlayer.name}`;
        } else {
            this.page.gameDashboard.innerHTML = `Player to throw: ${currentPlayer.name} Throw: ${this.numberOfThrows + 1}`;
        }
    }

    generateGameBoard() {
        this.page.playersListArea.innerHTML = '';
        this.fillDashboard();

        if (!this.gameStarted) {
            this.generatePlayersList();
        } else {
            const gameBoard = document.createElement('div');
            gameBoard.classList.add('game-board');

            for (const player of this.list) {
                const playerRow = document.createElement('div');
                playerRow.classList.add('playerRow3');
                if (this.whoseTurn === player.id) playerRow.classList.add('activePlayer');
                const nameCell = document.createElement('div');
                nameCell.classList.add('top-left');
                const progressCell = document.createElement('div');
                progressCell.classList.add('top-right');
                const buttonsCell = document.createElement('div');
                buttonsCell.classList.add('bottom');

                nameCell.innerHTML = `${player.name} [${player.number}]`;
                progressCell.append(player.getScore());

                if (this.gameOver === false) {
                    const tripleBtn = document.createElement('button');
                    tripleBtn.classList.add('targetBtn');
                    tripleBtn.innerHTML = `T ${player.number}`;
                    tripleBtn.addEventListener('click', () => {
                        this.processScore(player, 3);
                    });
                    const doubleBtn = document.createElement('button');
                    doubleBtn.classList.add('targetBtn');
                    doubleBtn.innerHTML = `D ${player.number}`;
                    doubleBtn.addEventListener('click', () => {
                        this.processScore(player, 2);
                    });
                    const singleBtn = document.createElement('button');
                    singleBtn.classList.add('targetBtn');
                    singleBtn.innerHTML = `S ${player.number}`;
                    singleBtn.addEventListener('click', () => {
                        this.processScore(player, 1);
                    });
                    const misBtn = document.createElement('button');
                    misBtn.classList.add('targetBtn');
                    misBtn.innerHTML = `Mis`;
                    misBtn.addEventListener('click', () => {
                        this.processScore(player, 0);
                    });

                    buttonsCell.append(tripleBtn);
                    buttonsCell.append(doubleBtn);
                    buttonsCell.append(singleBtn);
                    buttonsCell.append(misBtn);
                } else {
                    const restartBtn = document.createElement('button');
                    restartBtn.classList.add('targetBtn');
                    restartBtn.innerHTML = `Restart`;
                    restartBtn.addEventListener('click', () => {
                        this.restartGame();
                    });
                    buttonsCell.append(restartBtn);
                }

                playerRow.appendChild(nameCell);
                playerRow.appendChild(progressCell);
                playerRow.appendChild(buttonsCell);
                gameBoard.appendChild(playerRow);
            }

            this.page.playersListArea.appendChild(gameBoard);
        }
    }

    generatePlayersList() {
        this.page.playersListArea.innerHTML = '';

        if (0 === this.list.length) {
            this.page.playersListArea.innerHTML = 'To start a game add players first...';
        } else {
            for (const player of this.list) {
                const playerRow = document.createElement("div");
                playerRow.classList.add("playerRow");
                if (this.whoseTurn === player.id) playerRow.classList.add("activePlayer");
                const nameCell = document.createElement("div");
                const actionCell = document.createElement("div");

                if (!this.gameStarted) {
                    const deleteBtn = document.createElement("button");
                    deleteBtn.innerHTML = "Delete";
                    deleteBtn.addEventListener("click", () => {
                        this.deletePlayer(player.id);
                    });
                    actionCell.append(deleteBtn);

                    const startBtn = document.createElement("button");
                    startBtn.innerHTML = "Start";
                    startBtn.addEventListener("click", () => {
                        this.toggleFormView("exit");
                        this.whoseTurn = player.id;
                        this.gameStarted = true;
                        this.assignNumbers();
                        this.generateGameBoard();
                    });
                    actionCell.append(startBtn);
                }

                if (player.number !== 0) {
                    nameCell.innerHTML = `${player.name} [${player.number}]`;
                } else {
                    nameCell.innerHTML = player.name;
                }

                playerRow.appendChild(nameCell);
                playerRow.appendChild(actionCell);

                this.page.playersListArea.appendChild(playerRow);
            }
        }
    }

    deleteAllPlayers() {
        this.list = [];
        this.gameStarted = false;
        this.whoseTurn = null;
        this.generatePlayersList();
    }

    deletePlayer(id) {
        this.list.splice(id, 1);
        this.reassignIds();
        this.generatePlayersList();
        console.log(this.list);
    }

    reassignIds() {
        let counter = 0;
        for (const player of this.list) {
            player.setId(counter);
            counter++;
        }
    }

    assignNumbers() {
        const availableNumbers = [];
        for (let i = 1; i < 21; i++) availableNumbers.push(i);

        for (const player of this.list) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            player.number = availableNumbers.splice(randomIndex, 1)[0];
        }
    }

    restartGame() {
        this.gameStarted = false;
        this.whoseTurn = null;
        this.numberOfThrows = 0;
        this.gameOver = false;

        for (const player of this.list) {
            player.reset();
        }

        this.toggleFormView("addPlayer");
        this.generatePlayersList();
    }

    toggleFormView(view = null) {
        if ("addPlayer" === view) {
            this.page.exitForm.style.display = 'none';
            this.page.addPlayersForm.style.display = 'block';
        } else {
            this.page.exitForm.style.display = 'block';
            this.page.addPlayersForm.style.display = 'none';
        }
    }
}