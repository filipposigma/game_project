// --------------------------------------------------
// UI
// --------------------------------------------------

import { game } from './game.js';
import { drawCharacterShape } from './player.js';

// --------------------------------------------------
// HUD
// --------------------------------------------------

export function drawHud() {
    push();

    resetMatrix();

    fill(255);
    noStroke();
    textFont("Courier New");
    textStyle(BOLD);

    textAlign(LEFT, TOP);
    textSize(28);
    text("STARS", 55, 24);

    textSize(25);
    text(formatStars(game.score), 55, 52);

    textAlign(CENTER, TOP);
    textSize(28);
    text("LIVES", width / 2, 24);

    textSize(25);
    text(game.lives, width / 2, 52);

    textAlign(RIGHT, TOP);
    textSize(28);
    text("TIME", width - 70, 24);

    textSize(25);
    text(game.time, width - 70, 52);

    pop();

    textAlign(LEFT, BASELINE);
    textStyle(NORMAL);
}

function formatStars(starsCollected) {
    let starString = starsCollected.toString();

    while (starString.length < 2) {
        starString = `0${starString}`;
    }

    return starString;
}

// --------------------------------------------------
// END MESSAGE
// --------------------------------------------------

export function drawEndMessage() {
    if (game.levelComplete) {
        drawLevelCompleteScreen();
        return;
    }

    noStroke();

    fill(255, 255, 255, 230);
    rect(width / 2 - 230, height / 2 - 80, 460, 160, 10);

    fill(30, 45, 55);

    textFont("Helvetica");
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);

    textSize(32);
    text("Game Over", width / 2, height / 2 - 25);

    textSize(18);
    text(`Score: ${game.score}    Press R to restart`, width / 2, height / 2 + 25);

    textAlign(LEFT, BASELINE);
}

// --------------------------------------------------
// LEVEL COMPLETE SCREEN
// --------------------------------------------------

function drawLevelCompleteScreen() {
    background(0);

    noStroke();
    fill(255);
    textFont("Courier New");
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    textSize(54);
    text("LEVEL COMPLETE", width / 2, height / 2 - 140);

    push();
    translate(width / 2, height / 2 + 60);
    scale(2.2);
    noStroke();
    drawCharacterShape(0, 0, true);
    pop();

    fill(255);
    textSize(18);
    text(`Score: ${game.score}    Press R to restart`, width / 2, height / 2 + 100);

    textAlign(LEFT, BASELINE);
    textStyle(NORMAL);
}