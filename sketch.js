let floorPosY;
let gameCharX;
let gameCharY;
let gameCharWorldX;
let gameCharVelocityY;
let scrollPos;
let gameScore;
let lives;
let gameOver;
let levelComplete;
let isLeft;
let isRight;
let isFalling;
let isPlummeting;
let isOnPlatform;

let treesX;
let clouds;
let mountains;
let canyons;
let stars;
let platforms;
let flagpole;

let enemies;
let enemySpawnTimer;
let suppressMusicForFall;
let suppressMusicForGameOver;

let jumpSound;
let backgroundMusic;
let fallSound;
let fallSoundPlayed;
let levelCompleteSound;
let gameOverSound;
let itemCollectSound;

let gameTime;
let gameStartTime;

// --------------------------------------------------
// PRELOAD
// --------------------------------------------------

function preload() {
    soundFormats("mp3", "wav");
    jumpSound = loadSound("assets/jump.wav", () => {}, () => { jumpSound = null; });
    fallSound = loadSound("assets/fall.wav", () => { fallSound.onended(onFallSoundEnded); }, () => { fallSound = null; });
    backgroundMusic = loadSound("assets/background-music.mp3", () => {}, () => { backgroundMusic = null; });
    levelCompleteSound = loadSound("assets/level_complete.mp3", () => {}, () => { levelCompleteSound = null; });
    itemCollectSound = loadSound("assets/item_collect.mp3", () => { itemCollectSound.setVolume(2); }, () => { itemCollectSound = null; });
    gameOverSound = loadSound("assets/game_over.mp3", () => { gameOverSound.onended(onGameOverSoundEnded); }, () => { gameOverSound = null; });
}

// --------------------------------------------------
// SETUP
// --------------------------------------------------

function setup() {
    createCanvas(1024, 576);
    floorPosY = floor(height * 0.87);
    textFont("Courier New");
    noSmooth();
    initialiseLevel();
    startNewGame();

    // Browsers block audio until the very first user interaction
    // (click, tap, or key press) anywhere on the page. userStartAudio()
    // with no arguments listens for that first interaction itself, so
    // the music starts as soon as that happens.
    if (typeof userStartAudio === "function") {
        userStartAudio().then(() => {
            startBackgroundMusic();
        });
    }
}

// --------------------------------------------------
// INITIALISE LEVEL
// --------------------------------------------------

function initialiseLevel() {
    treesX = [-700, -300, 150, 650, 1100, 1600, 2150, 2700];

    clouds = [
        { xPos: -600, yPos: 90, size: 0.6 },
        { xPos: -100, yPos: 140, size: 0.8 },
        { xPos: 420, yPos: 70, size: 0.5 },
        { xPos: 950, yPos: 120, size: 0.7 },
        { xPos: 1480, yPos: 65, size: 0.6 },
        { xPos: 2050, yPos: 135, size: 0.8 }
    ];

    canyons = [
        { xPos: 260, width: 90 },
        { xPos: 800, width: 90 },
        { xPos: 1340, width: 90 },
        { xPos: 1900, width: 90 }
    ];

    mountains = [
        { xPos: -500, height: 250 },
        { xPos: 430, height: 220 },
        { xPos: 960, height: 285 },
        { xPos: 1500, height: 240 },
        { xPos: 2100, height: 275 }
    ];

    stars = [
        { xPos: 100, yPos: floorPosY - 25, isFound: false },
        { xPos: 470, yPos: floorPosY - 145, isFound: false },
        { xPos: 735, yPos: floorPosY - 25, isFound: false },
        { xPos: 1065, yPos: floorPosY - 165, isFound: false },
        { xPos: 1560, yPos: floorPosY - 130, isFound: false },
        { xPos: 2140, yPos: floorPosY - 190, isFound: false },
        { xPos: 2390, yPos: floorPosY - 25, isFound: false },
        { xPos: 2360, yPos: floorPosY - 125, isFound: false },
        { xPos: 2520, yPos: floorPosY - 225, isFound: false },
        { xPos: 2520, yPos: floorPosY - 340, isFound: false }
    ];

    platforms = [
        createPlatform(450, floorPosY - 100, 50),
        createPlatform(990, floorPosY - 120, 70),
        createPlatform(1500, floorPosY - 90, 50),
        createPlatform(2070, floorPosY - 145, 70),
        createPlatform(2250, floorPosY - 50, 60),
        createPlatform(2330, floorPosY - 100, 60),
        createPlatform(2410, floorPosY - 150, 60),
        createPlatform(2490, floorPosY - 200, 60)
    ];

    flagpole = {
        xPos: 2600,
        isReached: false
    };

    enemies = [];
}

// --------------------------------------------------
// START NEW GAME
// --------------------------------------------------

function startNewGame() {
    gameScore = 0;
    lives = 3;
    gameOver = false;
    levelComplete = false;
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    isOnPlatform = false;
    scrollPos = 0;
    fallSoundPlayed = false;
    gameTime = 0;
    gameStartTime = millis();

    for (const star of stars) {
        star.isFound = false;
    }

    suppressMusicForFall = false;
    suppressMusicForGameOver = false;

    resetPlayer();

    if (levelCompleteSound && levelCompleteSound.isPlaying()) {
        levelCompleteSound.stop();
    }

    if (itemCollectSound && itemCollectSound.isPlaying()) {
        itemCollectSound.stop();
    }

    if (gameOverSound && gameOverSound.isPlaying()) {
        gameOverSound.stop();
    }

    startBackgroundMusic();
}

// --------------------------------------------------
// RESET PLAYER
// --------------------------------------------------

function resetPlayer() {
    gameCharX = width / 2;
    gameCharY = floorPosY;
    gameCharWorldX = gameCharX;
    gameCharVelocityY = 0;
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    isOnPlatform = false;
    scrollPos = 0;
    fallSoundPlayed = false;
    flagpole.isReached = false;

    // Enemies store their position in world coordinates relative to
    // scrollPos at spawn time. Since scrollPos resets to 0 here, any
    // existing enemies would suddenly sit far outside the now-reset
    // viewport and get pruned as "off-screen" - so clear them here and
    // let fresh ones spawn naturally from the edges again.
    enemies = [];
    enemySpawnTimer = 0;
}

// --------------------------------------------------
// RESET AFTER LOSING LIFE
// Identical to resetPlayer() - kept as its own named function
// since it reads more clearly at the call site in loseLife().
// --------------------------------------------------

function resetAfterLifeLost() {
    resetPlayer();
}

// --------------------------------------------------
// BACKGROUND MUSIC
// --------------------------------------------------

function startBackgroundMusic() {
    if (backgroundMusic && backgroundMusic.isLoaded() && !backgroundMusic.isPlaying()) {
        backgroundMusic.loop();
    }
}

function stopBackgroundMusic() {
    if (backgroundMusic && backgroundMusic.isPlaying()) {
        backgroundMusic.stop();
    }
}

// --------------------------------------------------
// FALL SOUND FINISHED
// --------------------------------------------------

function onFallSoundEnded() {
    suppressMusicForFall = false;

    if (!gameOver && !levelComplete) {
        startBackgroundMusic();
    }
}

// --------------------------------------------------
// GAME OVER SOUND FINISHED
// --------------------------------------------------

function onGameOverSoundEnded() {
    suppressMusicForGameOver = false;

    if (!gameOver && !levelComplete) {
        startBackgroundMusic();
    }
}

// --------------------------------------------------
// TRY TO START MUSIC (checked every frame)
// --------------------------------------------------

function attemptStartBackgroundMusic() {
    if (gameOver || levelComplete || isPlummeting) {
        return;
    }

    if (suppressMusicForFall || suppressMusicForGameOver) {
        return;
    }

    if (fallSound && fallSound.isPlaying()) {
        return;
    }

    if (gameOverSound && gameOverSound.isPlaying()) {
        return;
    }

    startBackgroundMusic();
}

// --------------------------------------------------
// DRAW
// --------------------------------------------------

function draw() {
    attemptStartBackgroundMusic();

    drawSky();

    if (!gameOver && !levelComplete) {
        updateGameChar();
        updateTimer();

        if (gameCharY > height + 100) {
            loseLife();
        }
    }

    push();
    translate(scrollPos, 0);
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

    if (gameOver || levelComplete) {
        drawEndMessage();
    }
}

// --------------------------------------------------
// SKY
// --------------------------------------------------

function drawSky() {
    background(75, 143, 245);
}

// --------------------------------------------------
// TREES
// --------------------------------------------------

function drawTrees() {
    for (const treeX of treesX) {
        noStroke();

        fill(39, 128, 7);
        rect(treeX - 45, floorPosY - 85, 30, 30);
        rect(treeX - 60, floorPosY - 55, 45, 30);
        rect(treeX + 30, floorPosY - 70, 30, 45);
        rect(treeX - 30, floorPosY - 105, 60, 30);

        fill(100, 205, 10);
        rect(treeX - 30, floorPosY - 95, 60, 30);
        rect(treeX - 45, floorPosY - 65, 90, 45);
        rect(treeX - 60, floorPosY - 25, 120, 30);

        fill(140, 225, 20);
        rect(treeX - 30, floorPosY - 95, 30, 20);
        rect(treeX - 45, floorPosY - 65, 35, 20);
        rect(treeX + 15, floorPosY - 35, 30, 15);

        fill(143, 78, 25);
        rect(treeX - 18, floorPosY - 5, 36, 30);

        fill(180, 92, 28);
        rect(treeX - 12, floorPosY - 5, 15, 30);
    }
}

// --------------------------------------------------
// GROUND
// --------------------------------------------------

function drawGround() {
    noStroke();

    fill(211, 91, 12);
    rect(-2000, floorPosY, 6000, height - floorPosY);

    fill(235, 117, 14);
    rect(-2000, floorPosY, 6000, 7);

    fill(121, 54, 18);

    for (let x = -1900; x < 4000; x += 90) {
        rect(x, floorPosY + 35, 18, 5);
        rect(x + 40, floorPosY + 75, 12, 4);
        rect(x + 70, floorPosY + 110, 20, 5);
    }

    fill(145, 60, 16);

    for (let x = -1800; x < 4000; x += 150) {
        rect(x, floorPosY + 55, 10, 5);
        rect(x + 75, floorPosY + 92, 15, 5);
    }
}

// --------------------------------------------------
// MOUNTAINS
// --------------------------------------------------

function drawMountains() {
    noStroke();

    for (const mountain of mountains) {
        const mountainWidth = 260;

        fill(111, 143, 134);
        triangle(mountain.xPos, floorPosY, mountain.xPos + mountainWidth / 2, floorPosY - mountain.height, mountain.xPos + mountainWidth, floorPosY);

        fill(174, 198, 188);
        triangle(mountain.xPos + mountainWidth / 2, floorPosY - mountain.height, mountain.xPos + mountainWidth * 0.64, floorPosY - mountain.height * 0.55, mountain.xPos + mountainWidth, floorPosY);

        fill(91, 123, 116);
        triangle(mountain.xPos, floorPosY, mountain.xPos + mountainWidth / 2, floorPosY - mountain.height, mountain.xPos + mountainWidth * 0.38, floorPosY);
    }
}

// --------------------------------------------------
// CLOUDS
// --------------------------------------------------

function drawClouds() {
    noStroke();

    for (const cloud of clouds) {
        push();
        translate(cloud.xPos, cloud.yPos);
        scale(cloud.size);

        fill(211, 229, 240);
        ellipse(0, 20, 110, 45);
        ellipse(-45, 15, 70, 40);
        ellipse(45, 15, 70, 40);

        fill(250, 253, 255);
        ellipse(0, 5, 100, 50);
        ellipse(-45, 10, 70, 45);
        ellipse(45, 10, 70, 45);
        ellipse(0, -15, 70, 55);

        pop();
    }
}

// --------------------------------------------------
// CANYONS
// --------------------------------------------------

function drawCanyons() {
    for (const canyon of canyons) {
        noStroke();
        fill(75, 143, 245);
        rect(canyon.xPos, floorPosY, canyon.width, height - floorPosY);
    }
}

// --------------------------------------------------
// COLLECTABLE STARS
// --------------------------------------------------

function drawStars() {
    for (const star of stars) {
        if (!star.isFound) {
            drawCollectableStar(star.xPos, star.yPos);
        }
    }
}

// --------------------------------------------------
// PIXEL STAR
// --------------------------------------------------

function drawCollectableStar(x, y) {
    push();

    translate(x, y - 5);
    noStroke();

    fill(221, 125, 13);
    beginShape();
    vertex(0, -23);
    vertex(6, -9);
    vertex(21, -9);
    vertex(10, 1);
    vertex(14, 16);
    vertex(0, 8);
    vertex(-14, 16);
    vertex(-10, 1);
    vertex(-21, -9);
    vertex(-6, -9);
    endShape(CLOSE);

    fill(255, 166, 24);
    beginShape();
    vertex(0, -25);
    vertex(6, -10);
    vertex(22, -10);
    vertex(11, 1);
    vertex(15, 16);
    vertex(0, 9);
    vertex(-15, 16);
    vertex(-11, 1);
    vertex(-22, -10);
    vertex(-6, -10);
    endShape(CLOSE);

    fill(255, 181, 30);
    rect(-6, -8, 12, 13);

    fill(225, 69, 14);
    rect(-7, -5, 3, 7);
    rect(4, -5, 3, 7);
    rect(-2, 5, 5, 3);

    pop();
}

// --------------------------------------------------
// PLATFORM FACTORY
// A simple factory function: each call returns a brand new
// platform object built from the arguments given to it.
// --------------------------------------------------

const createPlatform = (x, y, length) => ({ x, y, length });

// --------------------------------------------------
// DRAW PLATFORMS
// --------------------------------------------------

function drawPlatforms() {
    for (const platform of platforms) {
        fill(179, 82, 15);
        rect(platform.x, platform.y, platform.length, 25);

        fill(244, 139, 35);
        rect(platform.x, platform.y, platform.length, 19);

        fill(255, 170, 55);
        rect(platform.x, platform.y, platform.length, 5);

        fill(213, 103, 20);
        rect(platform.x + 15, platform.y + 7, 8, 5);
        rect(platform.x + platform.length - 25, platform.y + 8, 10, 4);
    }
}

// --------------------------------------------------
// FLAGPOLE
// --------------------------------------------------

function drawFlagpole() {
    stroke(45, 45, 45);
    strokeWeight(8);
    line(flagpole.xPos, floorPosY, flagpole.xPos, floorPosY - 180);

    stroke(90, 90, 90);
    strokeWeight(3);
    line(flagpole.xPos - 1, floorPosY, flagpole.xPos - 1, floorPosY - 180);

    noStroke();

    fill(245, 48, 27);
    triangle(flagpole.xPos, floorPosY - 175, flagpole.xPos + 70, floorPosY - 150, flagpole.xPos, floorPosY - 125);

    fill(255, 63, 36);
    triangle(flagpole.xPos + 2, floorPosY - 170, flagpole.xPos + 55, floorPosY - 151, flagpole.xPos + 2, floorPosY - 140);

    fill(255);
    textFont("Courier New");
    textSize(13);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("FINISH", flagpole.xPos + 28, floorPosY - 150);
    textAlign(LEFT, BASELINE);
}

// --------------------------------------------------
// ENEMIES (turtles)
// Built with a constructor function so each turtle is its own
// object carrying its own position, direction and speed, with
// shared behaviour (update/draw/off-screen check) on the
// prototype. Turtles spawn from the left or right edge of the
// visible screen, walk straight in, turn back at canyon edges
// instead of falling in, and despawn once well off-screen.
// --------------------------------------------------

function Turtle(xPos, direction) {
    this.xPos = xPos;
    this.direction = direction;
    this.speed = 1.3;
}

Turtle.prototype.update = function() {
    const nextX = this.xPos + this.direction * this.speed;

    if (isOverCanyon(nextX)) {
        this.direction *= -1;
    } else {
        this.xPos = nextX;
    }
};

Turtle.prototype.isOffScreen = function() {
    const screenX = this.xPos + scrollPos;
    return screenX < -100 || screenX > width + 100;
};

Turtle.prototype.draw = function() {
    push();

    translate(this.xPos, floorPosY);
    scale(this.direction * 1.4, 1.4);
    noStroke();

    // feet
    fill(90, 55, 25);
    rect(-9, -6, 6, 6);
    rect(3, -6, 6, 6);

    // shell
    fill(215, 100, 30);
    rect(-11, -24, 22, 16);

    fill(240, 140, 50);
    rect(-9, -22, 18, 6);

    // shell pattern
    fill(160, 70, 20);
    rect(-6, -18, 4, 4);
    rect(2, -18, 4, 4);

    // head
    fill(250, 175, 90);
    rect(6, -20, 9, 9);

    // eye
    fill(10, 10, 10);
    rect(11, -18, 2, 2);

    pop();
};

function spawnEnemy() {
    const spawnFromLeft = random() < 0.5;
    const screenEdgeX = spawnFromLeft ? -30 : width + 30;
    const direction = spawnFromLeft ? 1 : -1;

    enemies.push(new Turtle(screenEdgeX - scrollPos, direction));
}

function updateEnemies() {
    enemySpawnTimer++;

    if (enemySpawnTimer > 180) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();

        if (enemies[i].isOffScreen()) {
            enemies.splice(i, 1);
        }
    }
}

function isOverCanyon(x) {
    for (const canyon of canyons) {
        if (x > canyon.xPos && x < canyon.xPos + canyon.width) {
            return true;
        }
    }

    return false;
}

function drawEnemies() {
    for (const enemy of enemies) {
        enemy.draw();
    }
}

// --------------------------------------------------
// GAME CHARACTER
// --------------------------------------------------

function drawGameChar() {
    push();

    translate(gameCharX - scrollPos, gameCharY);

    let facingRight = true;

    if (isLeft) {
        facingRight = false;
    }

    if (facingRight) {
        scale(1, 1);
    } else {
        scale(-1, 1);
    }

    noStroke();

    // Walking animation offsets for legs/feet
    let stepOffsetL = 0;
    let stepOffsetR = 0;

    if ((isLeft || isRight) && !isFalling && !isPlummeting) {
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
// The character's body, assuming the caller has already set up
// the translate/scale for where and how big to draw it. Shared
// between normal gameplay rendering (drawGameChar) and the big
// standalone portrait on the level-complete screen.
// --------------------------------------------------

function drawCharacterShape(stepOffsetL, stepOffsetR, facingRight) {
    // SHOES

    fill(95, 60, 35);
    rect(-10 + stepOffsetL * 0.3, -6, 8, 6);
    rect(2 + stepOffsetR * 0.3, -6, 8, 6);

    // LEGS / SHORTS (red)

    fill(210, 40, 30);
    rect(-9, -18, 18, 12);

    fill(180, 28, 20);
    rect(-9, -9, 18, 3);

    // TORSO (red shirt with a simple chest panel)

    fill(228, 55, 35);
    rect(-11, -34, 22, 16);

    fill(246, 241, 226);
    rect(-6, -32, 12, 11);

    push();

    if (!facingRight) {
        scale(-1, 1);
    }

    fill(20, 20, 20);
    textFont("Courier New");
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    textSize(8);
    text("F", 0, -26);

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

    // HEAD (big, chibi proportions)

    fill(250, 190, 130);
    rect(-12, -58, 24, 24);

    fill(232, 168, 110);
    rect(-12, -37, 24, 3);

    // HAIR / CAP

    fill(60, 40, 25);
    rect(-13, -59, 26, 8);
    rect(-14, -53, 6, 5);

    // EYES

    fill(25, 20, 15);
    rect(-5, -47, 4, 5);
    rect(4, -47, 4, 5);

    // MOUTH

    fill(190, 100, 70);
    rect(-3, -40, 5, 2);
}

// --------------------------------------------------
// UPDATE CHARACTER
// --------------------------------------------------

function updateGameChar() {
    updateEnemies();

    if (isPlummeting) {
        gameCharVelocityY += 1;
        gameCharY += gameCharVelocityY;
        return;
    }

    moveGameChar();
    applyGravity();

    gameCharWorldX = gameCharX - scrollPos;
    isOnPlatform = false;

    for (const platform of platforms) {
        if (gameCharWorldX > platform.x && gameCharWorldX < platform.x + platform.length && gameCharY >= platform.y - 5 && gameCharY <= platform.y + 20 && gameCharVelocityY >= 0) {
            gameCharY = platform.y;
            gameCharVelocityY = 0;
            isFalling = false;
            isOnPlatform = true;
        }
    }

    checkCanyons();
    checkStars();
    checkFlagpole();
    checkEnemyCollision();
}

// --------------------------------------------------
// MOVE CHARACTER
// --------------------------------------------------

function moveGameChar() {
    if (isLeft) {
        gameCharX -= 3;
    }

    if (isRight) {
        gameCharX += 3;
    }

    const leftBoundary = width * 0.25;
    const rightBoundary = width * 0.75;

    if (gameCharX < leftBoundary) {
        scrollPos += leftBoundary - gameCharX;
        gameCharX = leftBoundary;
    }

    if (gameCharX > rightBoundary) {
        scrollPos -= gameCharX - rightBoundary;
        gameCharX = rightBoundary;
    }
}

// --------------------------------------------------
// GRAVITY
// --------------------------------------------------

function applyGravity() {
    if (!isOnPlatform) {
        gameCharVelocityY += 0.7;
        gameCharY += gameCharVelocityY;

        if (gameCharY >= floorPosY) {
            gameCharY = floorPosY;
            gameCharVelocityY = 0;
            isFalling = false;
        } else {
            isFalling = true;
        }
    }
}

// --------------------------------------------------
// JUMP
// --------------------------------------------------

function jump() {
    if (!isFalling && !isPlummeting) {
        gameCharVelocityY = -16;
        isFalling = true;

        if (jumpSound && jumpSound.isLoaded()) {
            jumpSound.stop();
            jumpSound.play();
        }
    }
}

// --------------------------------------------------
// CHECK CANYONS
// --------------------------------------------------

function checkCanyons() {
    const characterLeft = gameCharWorldX - 11;
    const characterRight = gameCharWorldX + 11;

    for (const canyon of canyons) {
        const insideCanyon = characterRight > canyon.xPos && characterLeft < canyon.xPos + canyon.width && gameCharY >= floorPosY - 5;

        if (insideCanyon) {
            if (!isPlummeting) {
                isPlummeting = true;
                isFalling = true;
                isLeft = false;
                isRight = false;

                stopBackgroundMusic();

                if (!fallSoundPlayed && fallSound && fallSound.isLoaded()) {
                    fallSoundPlayed = true;
                    suppressMusicForFall = true;

                    if (fallSound.isPlaying()) {
                        fallSound.stop();
                    }

                    fallSound.play();
                } else {
                    suppressMusicForFall = false;
                }
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
            const distance = dist(gameCharWorldX, gameCharY - 40, star.xPos, star.yPos);

            if (distance < 30) {
                star.isFound = true;
                gameScore++;

                if (itemCollectSound && itemCollectSound.isLoaded()) {
                    itemCollectSound.stop();
                    itemCollectSound.play();
                }
            }
        }
    }
}

// --------------------------------------------------
// CHECK FLAGPOLE
// --------------------------------------------------

function checkFlagpole() {
    const distance = abs(gameCharWorldX - flagpole.xPos);

    if (distance < 35 && !flagpole.isReached) {
        flagpole.isReached = true;
        levelComplete = true;
        isLeft = false;
        isRight = false;
        stopBackgroundMusic();

        if (levelCompleteSound && levelCompleteSound.isLoaded()) {
            levelCompleteSound.stop();
            levelCompleteSound.play();
        }
    }
}

// --------------------------------------------------
// CHECK ENEMY COLLISION
// --------------------------------------------------

function checkEnemyCollision() {
    if (gameCharY < floorPosY - 10) {
        return;
    }

    for (const enemy of enemies) {
        const distance = abs(gameCharWorldX - enemy.xPos);

        if (distance < 24) {
            stopBackgroundMusic();

            if (gameOverSound && gameOverSound.isLoaded()) {
                suppressMusicForGameOver = true;

                if (gameOverSound.isPlaying()) {
                    gameOverSound.stop();
                }

                gameOverSound.play();
            } else {
                suppressMusicForGameOver = false;
            }

            loseLife();
            return;
        }
    }
}

// --------------------------------------------------
// TIMER
// --------------------------------------------------

function updateTimer() {
    gameTime = floor((millis() - gameStartTime) / 1000);
}

// --------------------------------------------------
// LOSE LIFE
// --------------------------------------------------

function loseLife() {
    if (gameOver || levelComplete) {
        return;
    }

    lives--;

    if (lives > 0) {
        resetAfterLifeLost();
    } else {
        gameOver = true;
        isPlummeting = false;
        isFalling = false;
        stopBackgroundMusic();

        if (fallSound && fallSound.isPlaying()) {
            fallSound.stop();
        }
    }
}

// --------------------------------------------------
// HUD
// --------------------------------------------------

function drawHud() {
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
    text(formatStars(gameScore), 55, 52);

    textAlign(CENTER, TOP);
    textSize(28);
    text("LIVES", width / 2, 24);

    textSize(25);
    text(lives, width / 2, 52);

    textAlign(RIGHT, TOP);
    textSize(28);
    text("TIME", width - 70, 24);

    textSize(25);
    text(gameTime, width - 70, 52);

    pop();

    textAlign(LEFT, BASELINE);
    textStyle(NORMAL);
}

// --------------------------------------------------
// FORMAT STARS
// --------------------------------------------------

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

function drawEndMessage() {
    if (levelComplete) {
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
    text(`Score: ${gameScore}    Press R to restart`, width / 2, height / 2 + 25);

    textAlign(LEFT, BASELINE);
}

// --------------------------------------------------
// LEVEL COMPLETE SCREEN
// Full black background, "LEVEL COMPLETE" in the same font as
// the HUD, and a big standalone portrait of the game character
// underneath.
// --------------------------------------------------

function drawLevelCompleteScreen() {
    background(0);

    noStroke();
    fill(255);
    textFont("Courier New");
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    textSize(54);
    text("LEVEL 1 COMPLETE", width / 2, height / 2 - 140);

    push();
    translate(width / 2, height / 2 + 60);
    scale(2.2);
    noStroke();
    drawCharacterShape(0, 0, true);
    pop();

    fill(255);
    textSize(18);
    text(`Score: ${gameScore}    Press R to restart`, width / 2, height / 2 + 100);

    textAlign(LEFT, BASELINE);
    textStyle(NORMAL);
}

// --------------------------------------------------
// KEY PRESSED
// --------------------------------------------------

function keyPressed() {
    // A key press is a valid user gesture, so unlock audio here. This
    // applies to every key - left arrow, right arrow, jump, all of
    // them - and attemptStartBackgroundMusic() is also called directly
    // below so the music starts immediately rather than waiting for
    // the next frame.
    if (typeof userStartAudio === "function") {
        userStartAudio();
    }

    attemptStartBackgroundMusic();

    if (key === "r" || key === "R") {
        startNewGame();
        return;
    }

    if (gameOver || levelComplete) {
        return;
    }

    if (keyCode === LEFT_ARROW) {
        isLeft = true;
    }

    if (keyCode === RIGHT_ARROW) {
        isRight = true;
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
        isLeft = false;
    }

    if (keyCode === RIGHT_ARROW) {
        isRight = false;
    }
}