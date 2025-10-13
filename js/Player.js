"use strict";

export class Player {
    name;
    score = 0;
    number = 0;
    killer = false;
    id = null;
    inPlay = true;

    constructor(name) {
        this.name = name;
    }

    reset() {
        this.score = 0;
        this.number = 0;
        this.killer = false;
        this.inPlay = true;
    }

    increaseScore(weight) {
        if (this.score < 5) {
            if (this.score + weight > 5) this.score = 5;
            else this.score += weight;
        }
        this.setKiller();
    }

    decreaseScore(weight) {
        if (this.score !== 0) {
            if (this.score - weight <= 0) {
                this.score = 0;
                this.inPlay = false;
            } else {
                this.score -= weight;
            }
        }

        this.setKiller();
    }

    setNumber(number) {
        this.number = number;
    }

    getNumber() {
        return this.number;
    }

    setKiller() {
        this.killer = (this.score >= 5);
    }

    setId(id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    createImage(src) {
        const imageContainer = document.createElement('div');
        const image = document.createElement('img');
        image.classList.add('image');
        image.src = src;
        imageContainer.appendChild(image);

        return imageContainer;
    }

    getScore() {
        if (!this.inPlay) return this.createImage("img/sad.png");
        if (this.inPlay && this.score === 100) return this.createImage("img/winner.png");
        if (this.inPlay && this.score === 0) return this.createImage("img/0.png");
        if (this.inPlay && this.score === 1) return this.createImage("img/1.png");
        if (this.inPlay && this.score === 2) return this.createImage("img/2.png");
        if (this.inPlay && this.score === 3) return this.createImage("img/3.png");
        if (this.inPlay && this.score === 4) return this.createImage("img/4.png");
        return (this.score < 5) ? this.score : this.createImage("img/5.png");
    }
}