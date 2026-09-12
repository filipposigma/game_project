var floorPos_y;
var gameChar_x;
var gameChar_y;
var gameChar_world_x;
var gameChar_velocity_y;
var scrollPos;
var game_score;
var lives;
var gameOver;
var levelComplete;
var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isOnPlatform;

var trees_x;
var clouds;
var mountains;
var canyons;
var apples;
var platforms;
var flagpole;

var enemies;
var enemySpawnTimer;
var suppressMusicForFall;
var suppressMusicForGameOver;

var jumpSound;
var backgroundMusic;
var fallSound;
var fallSoundPlayed;
var levelCompleteSound;
var gameOverSound;
var itemCollectSound;

var gameTime;
var gameStartTime;

// --------------------------------------------------
// PRELOAD
// --------------------------------------------------

function preload() {
    soundFormats("mp3", "wav");
    jumpSound = loadSound("assets/jump.wav", function() {}, function() { jumpSound = null; });
    fallSound = loadSound("assets/fall.wav", function() { fallSound.onended(onFallSoundEnded); }, function() { fallSound = null; });
    backgroundMusic = loadSound("assets/background-music.mp3", function() {}, function() { backgroundMusic = null; });
    levelCompleteSound = loadSound("assets/level_complete.mp3", function() {}, function() { levelCompleteSound = null; });
    itemCollectSound = loadSound("assets/item_collect.mp3", function() { itemCollectSound.setVolume(2); }, function() { itemCollectSound = null; });
    gameOverSound = loadSound("assets/game_over.mp3", function() { gameOverSound.onended(onGameOverSoundEnded); }, function() { gameOverSound = null; });
}

// --------------------------------------------------
// SETUP
// --------------------------------------------------

function setup() {
    createCanvas(1024, 576);
    floorPos_y = floor(height * 0.87);
    textFont("Courier New");
    noSmooth();
    initialiseLevel();
    startNewGame();

    if (typeof userStartAudio === "function") {
        userStartAudio().then(function() {
            startBackgroundMusic();
        });
    }
}

// --------------------------------------------------
// INITIALISE LEVEL
// --------------------------------------------------

function initialiseLevel() {
    trees_x = [-700, -300, 150, 650, 1100, 1600, 2150, 2700];

    clouds = [
        {x_pos: -600, y_pos: 90, size: 0.6},
        {x_pos: -100, y_pos: 140, size: 0.8},
        {x_pos: 420, y_pos: 70, size: 0.5},
        {x_pos: 950, y_pos: 120, size: 0.7},
        {x_pos: 1480, y_pos: 65, size: 0.6},
        {x_pos: 2050, y_pos: 135, size: 0.8}
    ];

    canyons = [
        {x_pos: 260, width: 100},
        {x_pos: 800, width: 100},
        {x_pos: 1340, width: 100},
        {x_pos: 1900, width: 100}
    ];

    mountains = [
        {x_pos: -500, height: 250},
        {x_pos: 430, height: 220},
        {x_pos: 960, height: 285},
        {x_pos: 1500, height: 240},
        {x_pos: 2100, height: 275}
    ];

    apples = [
        {x_pos: 100, y_pos: floorPos_y - 25, isFound: false},
        {x_pos: 470, y_pos: floorPos_y - 145, isFound: false},
        {x_pos: 735, y_pos: floorPos_y - 25, isFound: false},
        {x_pos: 1065, y_pos: floorPos_y - 165, isFound: false},
        {x_pos: 1560, y_pos: floorPos_y - 130, isFound: false},
        {x_pos: 2140, y_pos: floorPos_y - 190, isFound: false},
        {x_pos: 2390, y_pos: floorPos_y - 25, isFound: false}
    ];

    platforms = [
        createPlatform(450, floorPos_y - 100, 50),
        createPlatform(990, floorPos_y - 120, 70),
        createPlatform(1500, floorPos_y - 90, 50),
        createPlatform(2070, floorPos_y - 145, 70)
    ];

    flagpole = {
        x_pos: 2600,
        isReached: false
    };

    enemies = [];
}

// --------------------------------------------------
// START NEW GAME
// --------------------------------------------------

function startNewGame() {
    game_score = 0;
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

    for (var i = 0; i < apples.length; i++) {
        apples[i].isFound = false;
    }

    enemies = [];
    enemySpawnTimer = 0;
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
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    gameChar_world_x = gameChar_x;
    gameChar_velocity_y = 0;
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    isOnPlatform = false;
    scrollPos = 0;
    fallSoundPlayed = false;
    flagpole.isReached = false;
}

// --------------------------------------------------
// RESET AFTER LOSING LIFE
// --------------------------------------------------

function resetAfterLifeLost() {
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    gameChar_world_x = gameChar_x;
    gameChar_velocity_y = 0;
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    isOnPlatform = false;
    scrollPos = 0;
    fallSoundPlayed = false;
    flagpole.isReached = false;
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
// START MUSIC 
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

        if (gameChar_y > height + 100) {
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
    drawApples();
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
    for (var i = 0; i < trees_x.length; i++) {
        var treeX = trees_x[i];

        noStroke();

        fill(39, 128, 7);
        rect(treeX - 45, floorPos_y - 85, 30, 30);
        rect(treeX - 60, floorPos_y - 55, 45, 30);
        rect(treeX + 30, floorPos_y - 70, 30, 45);
        rect(treeX - 30, floorPos_y - 105, 60, 30);

        fill(100, 205, 10);
        rect(treeX - 30, floorPos_y - 95, 60, 30);
        rect(treeX - 45, floorPos_y - 65, 90, 45);
        rect(treeX - 60, floorPos_y - 25, 120, 30);

        fill(140, 225, 20);
        rect(treeX - 30, floorPos_y - 95, 30, 20);
        rect(treeX - 45, floorPos_y - 65, 35, 20);
        rect(treeX + 15, floorPos_y - 35, 30, 15);

        fill(143, 78, 25);
        rect(treeX - 18, floorPos_y - 5, 36, 30);

        fill(180, 92, 28);
        rect(treeX - 12, floorPos_y - 5, 15, 30);
    }
}

// --------------------------------------------------
// GROUND
// --------------------------------------------------

function drawGround() {
    noStroke();

    fill(211, 91, 12);
    rect(-2000, floorPos_y, 6000, height - floorPos_y);

    fill(235, 117, 14);
    rect(-2000, floorPos_y, 6000, 7);

    fill(121, 54, 18);

    for (var x = -1900; x < 4000; x += 90) {
        rect(x, floorPos_y + 35, 18, 5);
        rect(x + 40, floorPos_y + 75, 12, 4);
        rect(x + 70, floorPos_y + 110, 20, 5);
    }

    fill(145, 60, 16);

    for (var j = -1800; j < 4000; j += 150) {
        rect(j, floorPos_y + 55, 10, 5);
        rect(j + 75, floorPos_y + 92, 15, 5);
    }
}

// --------------------------------------------------
// MOUNTAINS
// --------------------------------------------------

function drawMountains() {
    noStroke();

    for (var i = 0; i < mountains.length; i++) {
        var mountain = mountains[i];
        var mountainWidth = 260;

        fill(111, 143, 134);
        triangle(mountain.x_pos, floorPos_y, mountain.x_pos + mountainWidth / 2, floorPos_y - mountain.height, mountain.x_pos + mountainWidth, floorPos_y);

        fill(174, 198, 188);
        triangle(mountain.x_pos + mountainWidth / 2, floorPos_y - mountain.height, mountain.x_pos + mountainWidth * 0.64, floorPos_y - mountain.height * 0.55, mountain.x_pos + mountainWidth, floorPos_y);

        fill(91, 123, 116);
        triangle(mountain.x_pos, floorPos_y, mountain.x_pos + mountainWidth / 2, floorPos_y - mountain.height, mountain.x_pos + mountainWidth * 0.38, floorPos_y);
    }
}

// --------------------------------------------------
// CLOUDS
// --------------------------------------------------

function drawClouds() {
    noStroke();

    for (var i = 0; i < clouds.length; i++) {
        var cloud = clouds[i];

        push();
        translate(cloud.x_pos, cloud.y_pos);
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
    for (var i = 0; i < canyons.length; i++) {
        var canyon = canyons[i];

        noStroke();
        fill(75, 143, 245);
        rect(canyon.x_pos, floorPos_y, canyon.width, height - floorPos_y);
    }
}

// --------------------------------------------------
// COLLECTABLE STARS
// --------------------------------------------------

function drawApples() {
    for (var i = 0; i < apples.length; i++) {
        var apple = apples[i];

        if (!apple.isFound) {
            drawCollectableStar(apple.x_pos, apple.y_pos);
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
// PLATFORM CREATOR
// --------------------------------------------------

function createPlatform(x, y, length) {
    return {
        x: x,
        y: y,
        length: length
    };
}

// --------------------------------------------------
// DRAW PLATFORMS
// --------------------------------------------------

function drawPlatforms() {
    for (var i = 0; i < platforms.length; i++) {
        var platform = platforms[i];

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
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 180);

    stroke(90, 90, 90);
    strokeWeight(3);
    line(flagpole.x_pos - 1, floorPos_y, flagpole.x_pos - 1, floorPos_y - 180);

    noStroke();

    fill(245, 48, 27);
    triangle(flagpole.x_pos, floorPos_y - 175, flagpole.x_pos + 70, floorPos_y - 150, flagpole.x_pos, floorPos_y - 125);

    fill(255, 63, 36);
    triangle(flagpole.x_pos + 2, floorPos_y - 170, flagpole.x_pos + 55, floorPos_y - 151, flagpole.x_pos + 2, floorPos_y - 140);

    fill(255);
    textFont("Courier New");
    textSize(13);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("FINISH", flagpole.x_pos + 28, floorPos_y - 150);
    textAlign(LEFT, BASELINE);
}

// --------------------------------------------------
// ENEMIES (turtles)
// Spawn from the left or right edge of the visible screen
// at a steady interval, walk straight across, and despawn
// once they've gone well past the opposite edge.
// --------------------------------------------------

function spawnEnemy() {
    var spawnFromLeft = random() < 0.5;
    var screenEdgeX = spawnFromLeft ? -30 : width + 30;
    var direction = spawnFromLeft ? 1 : -1;

    enemies.push({
        x_pos: screenEdgeX - scrollPos,
        direction: direction,
        speed: 1.3
    });
}

function updateEnemies() {
    enemySpawnTimer++;

    if (enemySpawnTimer > 180) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    for (var i = enemies.length - 1; i >= 0; i--) {
        var enemy = enemies[i];
        var nextX = enemy.x_pos + enemy.direction * enemy.speed;

        if (isOverCanyon(nextX)) {
            enemy.direction *= -1;
        } else {
            enemy.x_pos = nextX;
        }

        var screenX = enemy.x_pos + scrollPos;

        if (screenX < -100 || screenX > width + 100) {
            enemies.splice(i, 1);
        }
    }
}

function isOverCanyon(x) {
    for (var i = 0; i < canyons.length; i++) {
        var canyon = canyons[i];

        if (x > canyon.x_pos && x < canyon.x_pos + canyon.width) {
            return true;
        }
    }

    return false;
}

function drawEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        drawTurtle(enemies[i].x_pos, enemies[i].direction);
    }
}

function drawTurtle(x, direction) {
    push();

    translate(x, floorPos_y);
    scale(direction * 1.4, 1.4);
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
}

// --------------------------------------------------
// GAME CHARACTER
// --------------------------------------------------

function drawGameChar() {
    push();

    translate(gameChar_x - scrollPos, gameChar_y);

    var facingRight = true;

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
    var stepOffsetL = 0;
    var stepOffsetR = 0;

    if ((isLeft || isRight) && !isFalling && !isPlummeting) {
        var step = floor(frameCount / 8) % 2;

        if (step === 0) {
            stepOffsetL = -3;
            stepOffsetR = 3;
        } else {
            stepOffsetL = 3;
            stepOffsetR = -3;
        }
    }


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

    pop();
}

// --------------------------------------------------
// UPDATE CHARACTER
// --------------------------------------------------

function updateGameChar() {
    updateEnemies();

    if (isPlummeting) {
        gameChar_velocity_y += 1;
        gameChar_y += gameChar_velocity_y;
        return;
    }

    moveGameChar();
    applyGravity();

    gameChar_world_x = gameChar_x - scrollPos;
    isOnPlatform = false;

    for (var i = 0; i < platforms.length; i++) {
        var platform = platforms[i];

        if (gameChar_world_x > platform.x && gameChar_world_x < platform.x + platform.length && gameChar_y >= platform.y - 5 && gameChar_y <= platform.y + 20 && gameChar_velocity_y >= 0) {
            gameChar_y = platform.y;
            gameChar_velocity_y = 0;
            isFalling = false;
            isOnPlatform = true;
        }
    }

    checkCanyons();
    checkApples();
    checkFlagpole();
    checkEnemyCollision();
}

// --------------------------------------------------
// MOVE CHARACTER
// --------------------------------------------------

function moveGameChar() {
    if (isLeft) {
        gameChar_x -= 3;
    }

    if (isRight) {
        gameChar_x += 3;
    }

    var leftBoundary = width * 0.25;
    var rightBoundary = width * 0.75;

    if (gameChar_x < leftBoundary) {
        scrollPos += leftBoundary - gameChar_x;
        gameChar_x = leftBoundary;
    }

    if (gameChar_x > rightBoundary) {
        scrollPos -= gameChar_x - rightBoundary;
        gameChar_x = rightBoundary;
    }
}

// --------------------------------------------------
// GRAVITY
// --------------------------------------------------

function applyGravity() {
    if (!isOnPlatform) {
        gameChar_velocity_y += 0.7;
        gameChar_y += gameChar_velocity_y;

        if (gameChar_y >= floorPos_y) {
            gameChar_y = floorPos_y;
            gameChar_velocity_y = 0;
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
        gameChar_velocity_y = -16;
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
    var characterLeft = gameChar_world_x - 11;
    var characterRight = gameChar_world_x + 11;

    for (var i = 0; i < canyons.length; i++) {
        var canyon = canyons[i];

        var insideCanyon = characterRight > canyon.x_pos && characterLeft < canyon.x_pos + canyon.width && gameChar_y >= floorPos_y - 5;

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
// CHECK COLLECTABLES
// --------------------------------------------------

function checkApples() {
    for (var i = 0; i < apples.length; i++) {
        var apple = apples[i];

        if (!apple.isFound) {
            var distance = dist(gameChar_world_x, gameChar_y - 40, apple.x_pos, apple.y_pos);

            if (distance < 30) {
                apple.isFound = true;
                game_score++;

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
    var distance = abs(gameChar_world_x - flagpole.x_pos);

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
    if (gameChar_y < floorPos_y - 10) {
        return;
    }

    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        var distance = abs(gameChar_world_x - enemy.x_pos);

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
    text(formatApples(game_score), 55, 52);

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
// FORMAT APPLES
// --------------------------------------------------

function formatApples(applesCollected) {
    var appleString = applesCollected.toString();

    while (appleString.length < 2) {
        appleString = "0" + appleString;
    }

    return appleString;
}

// --------------------------------------------------
// END MESSAGE
// --------------------------------------------------

function drawEndMessage() {
    noStroke();

    fill(255, 255, 255, 230);
    rect(width / 2 - 230, height / 2 - 80, 460, 160, 10);

    fill(30, 45, 55);

    textFont("Helvetica");
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);

    if (levelComplete) {
        textSize(32);
        text("Level Complete", width / 2, height / 2 - 25);

        textSize(18);
        text("Score: " + game_score + "    Press R to restart", width / 2, height / 2 + 25);
    } else if (gameOver) {
        textSize(32);
        text("Game Over", width / 2, height / 2 - 25);

        textSize(18);
        text("Score: " + game_score + "    Press R to restart", width / 2, height / 2 + 25);
    }

    textAlign(LEFT, BASELINE);
}

// --------------------------------------------------
// KEY PRESSED
// --------------------------------------------------

function keyPressed() {
 
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