"use strict";

import {Player} from "./Player.js";
import {Game} from "./Game.js";

const page = {
    testBtn: document.getElementById("test"),
    formsArea: document.getElementById('forms'),
    playersListArea: document.getElementById('players'),
    targetsArea: document.getElementById('targets'),
    nameInput: document.getElementById('name'),
    addPlayerBtn: document.getElementById('addPlayer'),
    deleteAllPlayersBtn: document.getElementById('deleteAllPlayers'),
    gameDashboard: document.getElementById('gameDashboard'),
    addPlayersForm: document.getElementById('addPlayersForm'),
    exitForm: document.getElementById('exitForm'),
    deleteGame: document.getElementById('deleteGame'),
}

const game = new Game(page);

game.toggleFormView("addPlayer");
game.generatePlayersList();

page.addPlayerBtn.addEventListener('click', e => {
    if ('' !== page.nameInput.value) {
        game.addPlayer(new Player(page.nameInput.value));
    }

    page.nameInput.value = '';
    page.nameInput.focus();
});

page.deleteAllPlayersBtn.addEventListener('click', e => {
    game.deleteAllPlayers();
});

page.deleteGame.addEventListener('click', e => {
    location.reload();
});


// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('http://localhost/projects/Repositories/05_Andere/darts-killer/js/service-worker.js')
//         .then(() => console.log('Service Worker geregistreerd!'))
//         .catch((error) => console.error('Registratiefout:', error));
// }

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('https://bartroosencampus.github.io/darts-killer/js/service-worker.js')
        .then(() => console.log('Service Worker geregistreerd!'))
        .catch((error) => console.error('Registratiefout:', error));
}