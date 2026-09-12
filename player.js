// --------------------------------------------------
// PLAYER
// --------------------------------------------------

import {world} from './world.js';
import {game} from './game.js';
import {canyons, stars, platforms, flagpole} from './level.js';
import {enemies, resetEnemies, updateEnemies} from './enemies.js';
import {
    stopBackgroundMusic,
    playFallSound,
    playItemCollectSound,
    playLevelCompleteSound,
    playGameOverSound,
    playJumpSound
} from './audio.js';

export const player = {
    x: 0,
    y: 0,
    worldX: 0,
    velocityY: 0,
    isLeft: false,
    isRight: false,
    isFalling: false,
    isPlummeting: false,
    isDying: false,
    isOnPlatform: false
};

// --------------------------------------------------
// RESET
// --------------------------------------------------

export function resetPlayer() {
    player.x = width / 2;
    player.y = world.floorPosY;
    player.worldX = player.x;
    player.velocityY = 0;
    player.isLeft = false;
    player.isRight = false;
    player.isFalling = false;
    player.isPlummeting = false;
    player.isDying = false;
    player.isOnPlatform = false;
    world.scrollPos = 0;
    flagpole.isReached = false;

    resetEnemies();
}

export function resetAfterLifeLost() {
    resetPlayer();
}

// --------------------------------------------------
// LOSE LIFE
// --------------------------------------------------

export function loseLife() {
    if (game.gameOver || game.levelComplete) {
        return;
    }

    game.lives--;

    if (game.lives > 0) {
        resetAfterLifeLost();
    } else {
        game.gameOver = true;
        player.isPlummeting = false;
        player.isDying = false;
        player.isFalling = false;
        stopBackgroundMusic();
    }
}

// --------------------------------------------------
// JUMP
// --------------------------------------------------

export function jump() {
    if (!player.isFalling && !player.isPlummeting && !player.isDying) {
        player.velocityY = -13;
        player.isFalling = true;
        playJumpSound();
    }
}

// --------------------------------------------------
// MOVE
// --------------------------------------------------

function moveGameChar() {
    if (player.isLeft) {
        player.x -= 5;
    }

    if (player.isRight) {
        player.x += 5;
    }

    const leftBoundary = width * 0.25;
    const rightBoundary = width * 0.75;

    if (player.x < leftBoundary) {
        world.scrollPos += leftBoundary - player.x;
        player.x = leftBoundary;
    }

    if (player.x > rightBoundary) {
        world.scrollPos -= player.x - rightBoundary;
        player.x = rightBoundary;
    }
}

// --------------------------------------------------
// GRAVITY
// --------------------------------------------------

function applyGravity() {
    if (!player.isOnPlatform) {
        player.velocityY += 0.7;
        player.y += player.velocityY;

        if (player.y >= world.floorPosY) {
            player.y = world.floorPosY;
            player.velocityY = 0;
            player.isFalling = false;
        } else {
            player.isFalling = true;
        }
    }
}

// --------------------------------------------------
// CHECK CANYONS
// --------------------------------------------------

function checkCanyons() {
    const characterLeft = player.worldX - 11;
    const characterRight = player.worldX + 11;

    for (const canyon of canyons) {
        const insideCanyon = characterRight > canyon.xPos && characterLeft < canyon.xPos + canyon.width && player.y >= world.floorPosY - 5;

        if (insideCanyon) {
            if (!player.isPlummeting) {
                player.isPlummeting = true;
                player.isFalling = true;
                player.isLeft = false;
                player.isRight = false;

                stopBackgroundMusic();
                playFallSound();
            }

            return;
        }
    }
}

// --------------------------------------------------
// CHECK STARS
// --------------------------------------------------

function checkStars() {
    for (const star of stars) {
        if (!star.isFound) {
            const distance = dist(player.worldX, player.y - 40, star.xPos, star.yPos);

            if (distance < 30) {
                star.isFound = true;
                game.score++;
                playItemCollectSound();
            }
        }
    }
}

// --------------------------------------------------
// CHECK FLAGPOLE
// --------------------------------------------------

function checkFlagpole() {
    const distance = abs(player.worldX - flagpole.xPos);

    if (distance < 35 && !flagpole.isReached) {
        flagpole.isReached = true;
        game.levelComplete = true;
        player.isLeft = false;
        player.isRight = false;
        stopBackgroundMusic();
        playLevelCompleteSound();
    }
}

// --------------------------------------------------
// CHECK ENEMY COLLISION
// --------------------------------------------------

function checkEnemyCollision() {
    if (player.y < world.floorPosY - 10) {
        return;
    }

    for (const enemy of enemies) {
        const distance = abs(player.worldX - enemy.xPos);

        if (distance < 24) {
            stopBackgroundMusic();
            playGameOverSound();
            startDeathBounce();
            return;
        }
    }
}

// --------------------------------------------------
// DEATH BOUNCE
// --------------------------------------------------

function startDeathBounce() {
    if (player.isDying) {
        return;
    }

    player.isDying = true;
    player.isFalling = true;
    player.isLeft = false;
    player.isRight = false;
    player.velocityY = -12;
}

// --------------------------------------------------
// UPDATE CHARACTER
// --------------------------------------------------

export function updateGameChar() {
    updateEnemies();

    if (player.isPlummeting) {
        player.velocityY += 1;
        player.y += player.velocityY;
        return;
    }

    if (player.isDying) {
        player.velocityY += 0.7;
        player.y += player.velocityY;
        return;
    }

    moveGameChar();
    applyGravity();

    player.worldX = player.x - world.scrollPos;
    player.isOnPlatform = false;

    for (const platform of platforms) {
        if (player.worldX > platform.x && player.worldX < platform.x + platform.length && player.y >= platform.y - 5 && player.y <= platform.y + 20 && player.velocityY >= 0) {
            player.y = platform.y;
            player.velocityY = 0;
            player.isFalling = false;
            player.isOnPlatform = true;
        }
    }

    checkCanyons();
    checkStars();
    checkFlagpole();
    checkEnemyCollision();
}

// --------------------------------------------------
// DRAW GAME CHARACTER
// --------------------------------------------------

export function drawGameChar() {
    push();

    translate(player.x - world.scrollPos, player.y);

    let facingRight = true;

    if (player.isLeft) {
        facingRight = false;
    }

    if (facingRight) {
        scale(1, 1);
    } else {
        scale(-1, 1);
    }

    noStroke();

    // Walking animation
    let stepOffsetL = 0;
    let stepOffsetR = 0;

    if ((player.isLeft || player.isRight) && !player.isFalling && !player.isPlummeting) {
        const step = floor(frameCount / 8) % 2;

        if (step === 0) {
            stepOffsetL = -3;
            stepOffsetR = 3;
        } else {
            stepOffsetL = 3;
            stepOffsetR = -3;
        }
    }

    drawCharacterShape(stepOffsetL, stepOffsetR, facingRight);

    pop();
}

// --------------------------------------------------
// CHARACTER SHAPE
// --------------------------------------------------

export function drawCharacterShape(stepOffsetL, stepOffsetR, facingRight) {
    // SHOES

    fill(95, 60, 35);
    rect(-10 + stepOffsetL * 0.3, -6, 8, 6);
    rect(2 + stepOffsetR * 0.3, -6, 8, 6);

    // LEGS / SHORTS

    fill(210, 40, 30);
    rect(-9, -18, 18, 12);

    fill(180, 28, 20);
    rect(-9, -9, 18, 3);

    // TORSO

    fill(228, 55, 35);
    rect(-11, -34, 22, 16);

    push();

    if (!facingRight) {
        scale(-1, 1);
    }

    pop();

    textAlign(LEFT, BASELINE);
    textStyle(NORMAL);

    // ARMS

    fill(218, 48, 30);
    rect(-14, -32, 5, 13);
    rect(9, -32, 5, 13);

    fill(250, 190, 130);
    rect(-14, -21, 5, 4);
    rect(9, -21, 5, 4);

    // HEAD

    fill(250, 190, 130);
    rect(-12, -58, 24, 24);

    fill(232, 168, 110);
    rect(-12, -37, 24, 3);

    // HAIR

    fill(0);
    rect(-13, -59, 26, 8);
    rect(-14, -53, 6, 5);

    // EYES

    fill(25, 20, 15);
    rect(-5, -47, 4, 5);
    rect(4, -47, 4, 5);
}