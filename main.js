// --------------------------------------------------
// MAIN
// --------------------------------------------------

import { world } from './world.js';
import { game, resetGameState, updateTimer } from './game.js';
import {
    preloadSounds,
    startBackgroundMusic,
    attemptStartBackgroundMusic,
    resetOneShotSounds
} from './audio.js';
import {
    initialiseLevel,
    resetStars,
    drawSky,
    drawTrees,
    drawGround,
    drawMountains,
    drawClouds,
    drawCanyons,
    drawStars,
    drawPlatforms,
    drawFlagpole
} from './level.js';
import { drawEnemies } from './enemies.js';
import {
    player,
    resetPlayer,
    jump,
    loseLife,
    updateGameChar,
    drawGameChar
} from './player.js';
import { drawHud, drawEndMessage } from './ui.js';

// --------------------------------------------------
// PRELOAD
// --------------------------------------------------

function preload() {
    preloadSounds();
}

// --------------------------------------------------
// SETUP
// --------------------------------------------------

function setup() {
    createCanvas(1024, 576);
    world.floorPosY = floor(height * 0.87);
    textFont("Courier New");
    noSmooth();
    initialiseLevel();
    startNewGame();

    if (typeof userStartAudio === "function") {
        userStartAudio().then(() => {
            startBackgroundMusic();
        });
    }
}

// --------------------------------------------------
// START NEW GAME
// --------------------------------------------------

function startNewGame() {
    resetGameState();
    resetStars();
    resetOneShotSounds();
    resetPlayer();
    startBackgroundMusic();
}

// --------------------------------------------------
// DRAW
// --------------------------------------------------

function draw() {
    attemptStartBackgroundMusic(player.isPlummeting);

    drawSky();

    if (!game.gameOver && !game.levelComplete) {
        updateGameChar();
        updateTimer();

        if (player.y > height + 100) {
            loseLife();
        }
    }

    push();
    translate(world.scrollPos, 0);
    drawMountains();
    drawClouds();
    drawTrees();
    drawGround();
    drawCanyons();
    drawPlatforms();
    drawStars();
    drawFlagpole();
    drawEnemies();
    drawGameChar();
    pop();

    drawHud();

    if (game.gameOver || game.levelComplete) {
        drawEndMessage();
    }
}

// --------------------------------------------------
// KEY PRESSED
// --------------------------------------------------

function keyPressed() {
    if (typeof userStartAudio === "function") {
        userStartAudio();
    }

    attemptStartBackgroundMusic(player.isPlummeting);

    if (key === "r" || key === "R") {
        startNewGame();
        return;
    }

    if (game.gameOver || game.levelComplete) {
        return;
    }

    if (keyCode === LEFT_ARROW) {
        player.isLeft = true;
    }

    if (keyCode === RIGHT_ARROW) {
        player.isRight = true;
    }

    if (keyCode === UP_ARROW || key === " ") {
        jump();
    }
}

// --------------------------------------------------
// KEY RELEASED
// --------------------------------------------------

function keyReleased() {
    if (keyCode === LEFT_ARROW) {
        player.isLeft = false;
    }

    if (keyCode === RIGHT_ARROW) {
        player.isRight = false;
    }
}

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.keyReleased = keyReleased;