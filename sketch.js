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

var jumpSound;
var backgroundMusic;
var fallSound;
var fallSoundPlayed;

var gameTime;
var gameStartTime;


// --------------------------------------------------
// PRELOAD
// --------------------------------------------------

function preload()
{
    soundFormats("mp3", "wav");

    jumpSound = loadSound("assets/jump.wav", function() {}, function() { jumpSound = null; });
    fallSound = loadSound("assets/fall.wav", function() {}, function() { fallSound = null; });
    backgroundMusic = loadSound("assets/background-music.mp3", function() {}, function() { backgroundMusic = null; });
}


// --------------------------------------------------
// SETUP
// --------------------------------------------------

function setup()
{
    createCanvas(1024, 576);
    floorPos_y = floor(height * 0.87);
    textFont("Courier New");

    initialiseLevel();
    startNewGame();
}


// --------------------------------------------------
// INITIALISE LEVEL
// --------------------------------------------------

function initialiseLevel()
{
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
        {x_pos: 800, width: 115},
        {x_pos: 1340, width: 130},
        {x_pos: 1900, width: 145}
    ];

    mountains = [
        {x_pos: -500, height: 250},
        {x_pos: 430, height: 220},
        {x_pos: 960, height: 285},
        {x_pos: 1500, height: 240},
        {x_pos: 2100, height: 275}
    ];

    apples = [
        {x_pos: -120, y_pos: floorPos_y - 25, isFound: false},
        {x_pos: 100, y_pos: floorPos_y - 25, isFound: false},
        {x_pos: 470, y_pos: floorPos_y - 145, isFound: false},
        {x_pos: 615, y_pos: floorPos_y - 25, isFound: false},
        {x_pos: 735, y_pos: floorPos_y - 25, isFound: false},
        {x_pos: 1065, y_pos: floorPos_y - 165, isFound: false},
        {x_pos: 1190, y_pos: floorPos_y - 25, isFound: false},
        {x_pos: 1560, y_pos: floorPos_y - 130, isFound: false},
        {x_pos: 1730, y_pos: floorPos_y - 25, isFound: false},
        {x_pos: 2140, y_pos: floorPos_y - 190, isFound: false},
        {x_pos: 2390, y_pos: floorPos_y - 25, isFound: false}
    ];

    platforms = [
        createPlatform(450, floorPos_y - 100, 50),
        createPlatform(990, floorPos_y - 120, 150),
        createPlatform(1500, floorPos_y - 90, 175),
        createPlatform(2070, floorPos_y - 145, 180)
    ];

    flagpole = {x_pos: 2600, isReached: false};
}


// --------------------------------------------------
// START NEW GAME
// --------------------------------------------------

function startNewGame()
{
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

    // Timer starts at 0
    gameTime = 0;
    gameStartTime = millis();

    for (var i = 0; i < apples.length; i++)
    {
        apples[i].isFound = false;
    }

    resetPlayer();
    startBackgroundMusic();
}


// --------------------------------------------------
// RESET PLAYER
// --------------------------------------------------

function resetPlayer()
{
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

function resetAfterLifeLost()
{
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

function startBackgroundMusic()
{
    if (backgroundMusic && backgroundMusic.isLoaded() && !backgroundMusic.isPlaying())
    {
        backgroundMusic.loop();
    }
}


function stopBackgroundMusic()
{
    if (backgroundMusic && backgroundMusic.isPlaying())
    {
        backgroundMusic.stop();
    }
}


// --------------------------------------------------
// DRAW
// --------------------------------------------------

function draw()
{
    drawSky();

    if (!gameOver && !levelComplete)
    {
        updateGameChar();
        updateTimer();

        if (gameChar_y > height + 100)
        {
            loseLife();
        }
    }

    push();

    translate(scrollPos, 0);

    drawMountains();
    drawClouds();
    drawGround();
    drawCanyons();
    drawTrees();
    drawPlatforms();
    drawApples();
    drawFlagpole();
    drawGameChar();

    pop();

    drawHud();

    if (gameOver || levelComplete)
    {
        drawEndMessage();
    }
}


// --------------------------------------------------
// SKY
// --------------------------------------------------

function drawSky()
{
    background(92, 148, 252);
}


// --------------------------------------------------
// GROUND
// --------------------------------------------------

function drawGround()
{
    noStroke();

    fill(200, 76, 12);
    rect(-2000, floorPos_y, 6000, height - floorPos_y);

    fill(0, 0, 0);

    for (var x = -1900; x < 4000; x += 90)
    {
        rect(x, floorPos_y + 35, 18, 5);
        rect(x + 40, floorPos_y + 75, 12, 4);
        rect(x + 70, floorPos_y + 110, 20, 5);
    }
}


// --------------------------------------------------
// MOUNTAINS
// --------------------------------------------------

function drawMountains()
{
    noStroke();

    for (var i = 0; i < mountains.length; i++)
    {
        var mountain = mountains[i];
        var mountainWidth = 260;

        fill(105, 135, 125);

        triangle(
            mountain.x_pos,
            floorPos_y,
            mountain.x_pos + mountainWidth / 2,
            floorPos_y - mountain.height,
            mountain.x_pos + mountainWidth,
            floorPos_y
        );

        fill(175, 195, 185);

        triangle(
            mountain.x_pos + mountainWidth / 2,
            floorPos_y - mountain.height,
            mountain.x_pos + mountainWidth * 0.64,
            floorPos_y - mountain.height * 0.55,
            mountain.x_pos + mountainWidth,
            floorPos_y
        );
    }
}


// --------------------------------------------------
// CLOUDS
// --------------------------------------------------

function drawClouds()
{
    noStroke();

    for (var i = 0; i < clouds.length; i++)
    {
        var cloud = clouds[i];

        push();

        translate(cloud.x_pos, cloud.y_pos);
        scale(cloud.size);

        fill(215, 235, 245);

        ellipse(0, 20, 110, 45);
        ellipse(-45, 15, 70, 40);
        ellipse(45, 15, 70, 40);

        fill(255);

        ellipse(0, 5, 100, 50);
        ellipse(-45, 10, 70, 45);
        ellipse(45, 10, 70, 45);
        ellipse(0, -15, 70, 55);

        pop();
    }
}


// --------------------------------------------------
// TREES
// --------------------------------------------------

function drawTrees()
{
    for (var i = 0; i < trees_x.length; i++)
    {
        var treeX = trees_x[i];

        fill(0, 168, 0);

        ellipse(treeX, floorPos_y - 170, 105, 105);
        ellipse(treeX - 40, floorPos_y - 145, 75, 75);
        ellipse(treeX + 40, floorPos_y - 145, 75, 75);
        ellipse(treeX, floorPos_y - 215, 75, 75);

        fill(128, 208, 16);
    }
}


// --------------------------------------------------
// CANALS
// --------------------------------------------------

function drawCanyons()
{
    for (var i = 0; i < canyons.length; i++)
    {
        var canyon = canyons[i];

        noStroke();
        fill(92, 148, 252);

        rect(
            canyon.x_pos,
            floorPos_y,
            canyon.width,
            height - floorPos_y
        );
    }
}


// --------------------------------------------------
// APPLES
// --------------------------------------------------

function drawApples()
{
    for (var i = 0; i < apples.length; i++)
    {
        var apple = apples[i];

        if (!apple.isFound)
        {
            push();

            translate(apple.x_pos, apple.y_pos);

            fill(220, 45, 45);

            ellipse(-7, 0, 18, 22);
            ellipse(7, 0, 18, 22);

            fill(55, 135, 55);
            ellipse(8, -12, 13, 7);

            stroke(80, 50, 30);
            strokeWeight(3);

            line(0, -9, 2, -17);

            noStroke();

            pop();
        }
    }
}


// --------------------------------------------------
// PLATFORM CREATOR
// --------------------------------------------------

function createPlatform(x, y, length)
{
    return {x: x, y: y, length: length};
}


// --------------------------------------------------
// DRAW PLATFORMS
// --------------------------------------------------

function drawPlatforms()
{
    for (var i = 0; i < platforms.length; i++)
    {
        var platform = platforms[i];

        fill(252, 152, 56);
        rect(platform.x, platform.y, platform.length, 24);

       fill(90, 55, 35);
    }
}


// --------------------------------------------------
// FLAGPOLE
// --------------------------------------------------

function drawFlagpole()
{
    stroke(60);
    strokeWeight(6);

    line(
        flagpole.x_pos,
        floorPos_y,
        flagpole.x_pos,
        floorPos_y - 180
    );

    noStroke();

    fill(220, 50, 50);

    triangle(
        flagpole.x_pos,
        floorPos_y - 175,
        flagpole.x_pos + 70,
        floorPos_y - 150,
        flagpole.x_pos,
        floorPos_y - 125
    );

    fill(255);

    textFont("Courier New");
    textSize(13);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);

    text(
        "FINISH",
        flagpole.x_pos + 28,
        floorPos_y - 150
    );

    textAlign(LEFT, BASELINE);
}


// --------------------------------------------------
// CHARACTER
// --------------------------------------------------

function drawGameChar()
{
    push();

    translate(gameChar_x - scrollPos, gameChar_y);
    scale(0.72);

    // BODY
    fill(45, 90, 180);
    rect(-12, -48, 24, 34, 4);

    // HEAD
    fill(240, 190, 145);
    ellipse(0, -62, 25, 25);

    // BLACK HAIR
    fill(15, 15, 15);

    arc(0, -65, 27, 25, PI, TWO_PI);

    rect(-13, -68, 5, 13);
    rect(8, -68, 5, 13);

    // EYES
    fill(20);

    ellipse(-5, -62, 3, 4);
    ellipse(5, -62, 3, 4);

    // LEGS
    fill(40, 55, 100);

    rect(-10, -14, 8, 14);
    rect(2, -14, 8, 14);

    // SHOES
    fill(35);

    rect(-13, -3, 12, 6, 2);
    rect(1, -3, 12, 6, 2);

    // ARMS
    fill(240, 190, 145);

    rect(-18, -45, 7, 23, 3);
    rect(11, -45, 7, 23, 3);

    pop();
}


// --------------------------------------------------
// UPDATE CHARACTER
// --------------------------------------------------

function updateGameChar()
{
    if (isPlummeting)
    {
        gameChar_velocity_y += 1;
        gameChar_y += gameChar_velocity_y;
        return;
    }

    moveGameChar();
    applyGravity();

    gameChar_world_x = gameChar_x - scrollPos;

    isOnPlatform = false;

    for (var i = 0; i < platforms.length; i++)
    {
        var platform = platforms[i];

        if (
            gameChar_world_x > platform.x &&
            gameChar_world_x < platform.x + platform.length &&
            gameChar_y >= platform.y - 5 &&
            gameChar_y <= platform.y + 20 &&
            gameChar_velocity_y >= 0
        )
        {
            gameChar_y = platform.y;
            gameChar_velocity_y = 0;
            isFalling = false;
            isOnPlatform = true;
        }
    }

    checkCanyons();
    checkApples();
    checkFlagpole();
}


// --------------------------------------------------
// MOVE CHARACTER
// --------------------------------------------------

function moveGameChar()
{
    if (isLeft)
    {
        gameChar_x -= 5;
    }

    if (isRight)
    {
        gameChar_x += 5;
    }

    var leftBoundary = width * 0.25;
    var rightBoundary = width * 0.75;

    if (gameChar_x < leftBoundary)
    {
        scrollPos += leftBoundary - gameChar_x;
        gameChar_x = leftBoundary;
    }

    if (gameChar_x > rightBoundary)
    {
        scrollPos -= gameChar_x - rightBoundary;
        gameChar_x = rightBoundary;
    }
}


// --------------------------------------------------
// GRAVITY
// --------------------------------------------------

function applyGravity()
{
    if (!isOnPlatform)
    {
        gameChar_velocity_y += 0.8;
        gameChar_y += gameChar_velocity_y;

        if (gameChar_y >= floorPos_y)
        {
            gameChar_y = floorPos_y;
            gameChar_velocity_y = 0;
            isFalling = false;
        }
        else
        {
            isFalling = true;
        }
    }
}


// --------------------------------------------------
// JUMP
// --------------------------------------------------

function jump()
{
    if (!isFalling && !isPlummeting)
    {
        gameChar_velocity_y = -14;
        isFalling = true;

        if (jumpSound && jumpSound.isLoaded())
        {
            jumpSound.stop();
            jumpSound.play();
        }
    }
}


// --------------------------------------------------
// CHECK CANALS
// --------------------------------------------------

function checkCanyons()
{
    var characterLeft = gameChar_world_x - 12;
    var characterRight = gameChar_world_x + 12;

    for (var i = 0; i < canyons.length; i++)
    {
        var canyon = canyons[i];

        var insideCanyon =
            characterRight > canyon.x_pos &&
            characterLeft < canyon.x_pos + canyon.width &&
            gameChar_y >= floorPos_y - 5;

        if (insideCanyon)
        {
            if (!isPlummeting)
            {
                isPlummeting = true;
                isFalling = true;

                isLeft = false;
                isRight = false;

                stopBackgroundMusic();

                if (
                    !fallSoundPlayed &&
                    fallSound &&
                    fallSound.isLoaded()
                )
                {
                    fallSoundPlayed = true;
                    fallSound.stop();
                    fallSound.play();
                }
            }

            return;
        }
    }
}


// --------------------------------------------------
// CHECK APPLES
// --------------------------------------------------

function checkApples()
{
    for (var i = 0; i < apples.length; i++)
    {
        var apple = apples[i];

        if (!apple.isFound)
        {
            var distance = dist(
                gameChar_world_x,
                gameChar_y - 45,
                apple.x_pos,
                apple.y_pos
            );

            if (distance < 30)
            {
                apple.isFound = true;
                game_score++;
            }
        }
    }
}


// --------------------------------------------------
// CHECK FLAGPOLE
// --------------------------------------------------

function checkFlagpole()
{
    var distance = abs(
        gameChar_world_x - flagpole.x_pos
    );

    if (distance < 35 && !flagpole.isReached)
    {
        flagpole.isReached = true;
        levelComplete = true;

        isLeft = false;
        isRight = false;

        stopBackgroundMusic();
    }
}


// --------------------------------------------------
// TIMER
// --------------------------------------------------

function updateTimer()
{
    gameTime = floor(
        (millis() - gameStartTime) / 1000
    );
}


// --------------------------------------------------
// LOSE LIFE
// --------------------------------------------------

function loseLife()
{
    if (gameOver || levelComplete)
    {
        return;
    }

    lives--;

    if (lives > 0)
    {
        resetAfterLifeLost();
        startBackgroundMusic();
    }
    else
    {
        gameOver = true;

        isPlummeting = false;
        isFalling = false;

        stopBackgroundMusic();

        if (fallSound && fallSound.isPlaying())
        {
            fallSound.stop();
        }
    }
}


// --------------------------------------------------
// HUD
// --------------------------------------------------

function drawHud()
{
    push();

    resetMatrix();

    fill(255);
    noStroke();

    textFont("Courier New");
    textStyle(BOLD);

    // APPLES
    textAlign(LEFT, TOP);
    textSize(28);
    text("APPLES", 55, 24);

    textSize(25);
    text(formatApples(game_score), 55, 52);

    // LIVES
    textAlign(CENTER, TOP);
    textSize(28);
    text("LIVES", width / 2, 24);

    textSize(25);
    text(lives, width / 2, 52);

    // TIME
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

function formatApples(applesCollected)
{
    var appleString = applesCollected.toString();

    while (appleString.length < 2)
    {
        appleString = "0" + appleString;
    }

    return appleString;
}


// --------------------------------------------------
// END MESSAGE
// --------------------------------------------------

function drawEndMessage()
{
    fill(255, 255, 255, 230);

    rect(
        width / 2 - 230,
        height / 2 - 80,
        460,
        160,
        10
    );

    fill(30, 45, 55);

    textFont("Helvetica");
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);

    if (levelComplete)
    {
        textSize(32);

        text(
            "Level Complete",
            width / 2,
            height / 2 - 25
        );

        textSize(18);

        text(
            "Score: " + game_score + "    Press R to restart",
            width / 2,
            height / 2 + 25
        );
    }
    else if (gameOver)
    {
        textSize(32);

        text(
            "Game Over",
            width / 2,
            height / 2 - 25
        );

        textSize(18);

        text(
            "Score: " + game_score + "    Press R to restart",
            width / 2,
            height / 2 + 25
        );
    }

    textAlign(LEFT, BASELINE);
}


// --------------------------------------------------
// KEY PRESSED
// --------------------------------------------------

function keyPressed()
{
    if (typeof userStartAudio === "function")
    {
        userStartAudio();
    }

    if (key === "r" || key === "R")
    {
        startNewGame();
        return;
    }

    if (gameOver || levelComplete)
    {
        return;
    }

    startBackgroundMusic();

    if (keyCode === LEFT_ARROW)
    {
        isLeft = true;
    }

    if (keyCode === RIGHT_ARROW)
    {
        isRight = true;
    }

    if (keyCode === UP_ARROW || key === " ")
    {
        jump();
    }
}


// --------------------------------------------------
// KEY RELEASED
// --------------------------------------------------

function keyReleased()
{
    if (keyCode === LEFT_ARROW)
    {
        isLeft = false;
    }

    if (keyCode === RIGHT_ARROW)
    {
        isRight = false;
    }
}
