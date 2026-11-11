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
    playJumpSound,
    playLaserSound
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
    isOnPlatform: false,
    facingDirection: 1 // 1 = right, -1 = left
};

// --------------------------------------------------
// LASERS
// --------------------------------------------------

const lasers = [];

const LASER_SPEED = 12;
const LASER_WIDTH = 24;
const LASER_HEIGHT = 4;
const LASER_COOLDOWN_MS = 200;
const LASER_LIFETIME_FRAMES = 90;

let lastLaserTime = -Infinity;

// Create a laser when the player shoots.
export function shootLaser() {
    if (
        game.gameOver ||
        game.levelComplete ||
        player.isDying ||
        player.isPlummeting
    ) {
        return;
    }

    const now = millis();

    if (now - lastLaserTime < LASER_COOLDOWN_MS) {
        return;
    }

    const direction = player.isRight
        ? 1
        : player.isLeft
            ? -1
            : player.facingDirection;

    player.facingDirection = direction;

    lasers.push({
        x: player.x - world.scrollPos
            + direction * (14 + LASER_WIDTH / 2),
        y: player.y - 26,
        direction,
        age: 0
    });

    lastLaserTime = now;
    playLaserSound();
}

// Move lasers and check whether they hit enemies.
function updateLasers() {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        const previousX = laser.x;

        laser.x += laser.direction * LASER_SPEED;
        laser.age++;

        // Check the whole distance travelled this frame.
        const laserLeft =
            Math.min(previousX, laser.x) - LASER_WIDTH / 2;

        const laserRight =
            Math.max(previousX, laser.x) + LASER_WIDTH / 2;

        const laserTop = laser.y - LASER_HEIGHT / 2;
        const laserBottom = laser.y + LASER_HEIGHT / 2;

        let hitIndex = -1;
        let closestDistance = Infinity;

        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];

            // These dimensions match your turtle drawing.
            const enemyLeft = enemy.xPos
                - (enemy.direction === 1 ? 11 : 15) * 1.4;

            const enemyRight = enemy.xPos
                + (enemy.direction === 1 ? 15 : 11) * 1.4;

            const enemyTop = world.floorPosY - 24 * 1.4;
            const enemyBottom = world.floorPosY;

            const hasHit =
                laserRight >= enemyLeft &&
                laserLeft <= enemyRight &&
                laserBottom >= enemyTop &&
                laserTop <= enemyBottom;

            if (hasHit) {
                const distance = laser.direction === 1
                    ? Math.max(
                        0,
                        enemyLeft - (previousX + LASER_WIDTH / 2)
                    )
                    : Math.max(
                        0,
                        previousX - LASER_WIDTH / 2 - enemyRight
                    );

                if (distance < closestDistance) {
                    closestDistance = distance;
                    hitIndex = j;
                }
            }
        }

        if (hitIndex !== -1) {
            enemies.splice(hitIndex, 1);
            lasers.splice(i, 1);
            continue;
        }

        const screenX = laser.x + world.scrollPos;

        if (
            laser.age >= LASER_LIFETIME_FRAMES ||
            screenX + LASER_WIDTH / 2 < -100 ||
            screenX - LASER_WIDTH / 2 > width + 100
        ) {
            lasers.splice(i, 1);
        }
    }
}

// Draw the red lasers.
export function drawLasers() {
    push();
    rectMode(CORNER);
    noStroke();

    for (const laser of lasers) {
        // Outer glow
        fill(255, 40, 60, 70);
        rect(
            laser.x - LASER_WIDTH / 2 - 3,
            laser.y - LASER_HEIGHT / 2 - 3,
            LASER_WIDTH + 6,
            LASER_HEIGHT + 6,
            4
        );

        // Red beam
        fill(255, 40, 60);
        rect(
            laser.x - LASER_WIDTH / 2,
            laser.y - LASER_HEIGHT / 2,
            LASER_WIDTH,
            LASER_HEIGHT,
            2
        );

        // Bright centre
        fill(255, 235, 235);
        rect(
            laser.x - LASER_WIDTH / 2 + 2,
            laser.y - 1,
            LASER_WIDTH - 4,
            2
        );
    }

    pop();
}

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
    player.facingDirection = 1;
    lasers.length = 0;
    lastLaserTime = -Infinity;
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
        lasers.length = 0;
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
    player.facingDirection = -1;
}

if (player.isRight) {
    player.x += 5;
    player.facingDirection = 1;
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
                lasers.length = 0;

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
            const distance = dist(
                player.worldX,
                player.y - 40,
                star.xPos,
                star.yPos
            );

            if (distance < 30) {
                star.isFound = true;
                game.score++;
                playItemCollectSound();

                // Award an extra life for every 10 stars.
                if (game.score % 10 === 0) {
                    game.lives++;
                }
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
        lasers.length = 0;
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
    lasers.length = 0;
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
    updateLasers();
    checkEnemyCollision();
}

// --------------------------------------------------
// DRAW GAME CHARACTER
// --------------------------------------------------

export function drawGameChar() {
    push();

    translate(player.x - world.scrollPos, player.y);

    const facingRight = player.facingDirection === 1;

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