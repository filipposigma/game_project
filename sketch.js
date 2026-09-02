// Part 7 game project - complete p5.js sketch
// Paste this file into the JavaScript editor in the p5.js web editor.

var floorPos_y;
var gameChar_x;
var gameChar_y;
var gameChar_world_x;
var gameChar_velocity_y;
var scrollPos;
var game_score;
var lives;
var levelComplete;
var gameOver;
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

function preload()
{
    soundFormats('mp3', 'wav');
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    backgroundMusic = loadSound('assets/background-music.mp3');
    fallSound = loadSound('assets/fall.wav');
    fallSound.setVolume(0.15);
}

function setup()
{
    createCanvas(1024, 576);
    floorPos_y = height * 0.75;
    lives = 3;
    startGame();
}

function startGame()
{
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    gameChar_velocity_y = 0;
    scrollPos = 0;
    game_score = 0;
    levelComplete = false;
    gameOver = false;
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    isOnPlatform = false;

    trees_x = [-700, -300, 150, 650, 1100, 1600, 2150, 2700];
    clouds = [
        {x_pos: -600, y_pos: 90, size: 0.9},
        {x_pos: -100, y_pos: 140, size: 1.2},
        {x_pos: 420, y_pos: 70, size: 0.8},
        {x_pos: 950, y_pos: 120, size: 1.1},
        {x_pos: 1480, y_pos: 65, size: 0.9},
        {x_pos: 2050, y_pos: 135, size: 1.2}
    ];
    mountains = [
        {x_pos: -800, height: 280},
        {x_pos: -100, height: 230},
        {x_pos: 650, height: 310},
        {x_pos: 1450, height: 250},
        {x_pos: 2200, height: 300}
    ];
    canyons = [
        {x_pos: 260, width: 100},
        {x_pos: 800, width: 115},
        {x_pos: 1340, width: 130},
        {x_pos: 1900, width: 145}
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

    platforms = [];
    platforms.push(createPlatform(400, floorPos_y - 100, 150));
    platforms.push(createPlatform(990, floorPos_y - 120, 150));
    platforms.push(createPlatform(1500, floorPos_y - 90, 175));
    platforms.push(createPlatform(2070, floorPos_y - 145, 180));

    flagpole = {x_pos: 2600, isReached: false};
}

function draw()
{
    drawSky();

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

    if(!gameOver && !levelComplete)
    {
        updateGameChar();
    }

    if(gameChar_y > height + 100 && !gameOver)
    {
        loseLife();
    }

    if(gameOver)
    {
        drawEndMessage("GAME OVER", "Press Enter to play again");
    }
    else if(levelComplete)
    {
        drawEndMessage("LEVEL COMPLETE!", "Press Enter to play again");
    }
}

function drawSky()
{
    background(60, 183, 240);
    noStroke();
    fill(120, 213, 255, 80);
    ellipse(width * 0.2, height * 0.1, 520, 260);
    ellipse(width * 0.8, height * 0.2, 620, 310);
}

function drawGround()
{
    var x;

    noStroke();
    fill(91, 58, 31);
    rect(-2000, floorPos_y, 6000, height - floorPos_y);
    fill(54, 158, 54);
    rect(-2000, floorPos_y, 6000, 18);
    fill(89, 205, 66);
    rect(-2000, floorPos_y, 6000, 7);

    for(x = -2000; x < 4000; x += 38)
    {
        noFill();
        stroke(112, 75, 43);
        strokeWeight(2);
        rect(x, floorPos_y + 35, 24, 20, 3);
    }
    noStroke();
}

function drawMountains()
{
    var i;

    for(i = 0; i < mountains.length; i++)
    {
        fill(100, 125, 162);
        triangle(
            mountains[i].x_pos,
            floorPos_y,
            mountains[i].x_pos + 230,
            floorPos_y - mountains[i].height,
            mountains[i].x_pos + 470,
            floorPos_y
        );
        fill(141, 159, 190);
        triangle(
            mountains[i].x_pos + 230,
            floorPos_y - mountains[i].height,
            mountains[i].x_pos + 230,
            floorPos_y,
            mountains[i].x_pos + 470,
            floorPos_y
        );
    }
}

function drawClouds()
{
    var i;

    for(i = 0; i < clouds.length; i++)
    {
        noStroke();
        fill(120, 140, 180, 70);
        ellipse(clouds[i].x_pos + 10, clouds[i].y_pos + 14, 78 * clouds[i].size, 48 * clouds[i].size);
        ellipse(clouds[i].x_pos + 55 * clouds[i].size, clouds[i].y_pos + 5, 92 * clouds[i].size, 62 * clouds[i].size);
        ellipse(clouds[i].x_pos + 105 * clouds[i].size, clouds[i].y_pos + 14, 80 * clouds[i].size, 50 * clouds[i].size);
        fill(250, 252, 255);
        ellipse(clouds[i].x_pos, clouds[i].y_pos, 70 * clouds[i].size, 45 * clouds[i].size);
        ellipse(clouds[i].x_pos + 45 * clouds[i].size, clouds[i].y_pos - 12, 85 * clouds[i].size, 60 * clouds[i].size);
        ellipse(clouds[i].x_pos + 95 * clouds[i].size, clouds[i].y_pos, 75 * clouds[i].size, 48 * clouds[i].size);
    }
}

function drawTrees()
{
    var i;

    for(i = 0; i < trees_x.length; i++)
    {
        noStroke();
        fill(92, 54, 27);
        rect(trees_x[i], floorPos_y - 115, 34, 115, 3);
        fill(117, 75, 38);
        rect(trees_x[i] + 9, floorPos_y - 110, 7, 105);
        fill(40, 123, 46);
        rect(trees_x[i] - 40, floorPos_y - 195, 110, 85, 8);
        fill(51, 157, 55);
        rect(trees_x[i] - 18, floorPos_y - 235, 68, 58, 7);
        rect(trees_x[i] - 60, floorPos_y - 165, 55, 55, 7);
        rect(trees_x[i] + 40, floorPos_y - 165, 55, 55, 7);
        noFill();
        stroke(30, 105, 36);
        strokeWeight(2);
        rect(trees_x[i] - 28, floorPos_y - 182, 22, 22, 3);
        rect(trees_x[i] + 8, floorPos_y - 182, 22, 22, 3);
        rect(trees_x[i] + 8, floorPos_y - 215, 22, 22, 3);
        noStroke();
    }
}

function drawCanyons()
{
    var i;

    for(i = 0; i < canyons.length; i++)
    {
        fill(25, 104, 174);
        rect(canyons[i].x_pos, floorPos_y, canyons[i].width, height - floorPos_y);
        fill(110, 210, 250, 160);
        rect(canyons[i].x_pos, floorPos_y + 10, canyons[i].width, 5);
        rect(canyons[i].x_pos + 12, floorPos_y + 42, canyons[i].width - 24, 4);
    }
}

function drawApples()
{
    var i;

    for(i = 0; i < apples.length; i++)
    {
        if(!apples[i].isFound)
        {
            noStroke();
            fill(152, 15, 20);
            ellipse(apples[i].x_pos, apples[i].y_pos + 3, 28, 28);
            fill(235, 35, 35);
            ellipse(apples[i].x_pos - 3, apples[i].y_pos, 24, 25);
            fill(255, 140, 130);
            ellipse(apples[i].x_pos - 8, apples[i].y_pos - 6, 6, 7);
            stroke(90, 55, 25);
            strokeWeight(3);
            line(apples[i].x_pos + 3, apples[i].y_pos - 15, apples[i].x_pos + 5, apples[i].y_pos - 24);
            noStroke();
            fill(60, 165, 55);
            ellipse(apples[i].x_pos + 10, apples[i].y_pos - 19, 13, 8);
        }
    }
}

function createPlatform(x, y, length)
{
    var platform = {
        x_pos: x,
        y_pos: y,
        length: length,
        draw: function()
        {
            var tileX;

            noStroke();
            fill(80, 50, 25);
            rect(this.x_pos + 8, this.y_pos + 14, this.length - 16, 20, 5);
            fill(46, 132, 47);
            rect(this.x_pos, this.y_pos, this.length, 18, 5);
            fill(91, 204, 66);
            rect(this.x_pos, this.y_pos, this.length, 7, 5);
            noFill();
            stroke(31, 108, 37);
            strokeWeight(2);
            for(tileX = this.x_pos + 8; tileX < this.x_pos + this.length - 8; tileX += 22)
            {
                rect(tileX, this.y_pos + 8, 13, 7, 2);
            }
            noStroke();
        },
        checkContact: function(characterX, characterY)
        {
            if(characterX > this.x_pos && characterX < this.x_pos + this.length)
            {
                if(characterY >= this.y_pos - 4 && characterY <= this.y_pos + 8)
                {
                    return true;
                }
            }
            return false;
        }
    };

    return platform;
}

function drawPlatforms()
{
    var i;

    for(i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }
}

function drawFlagpole()
{
    stroke(91, 54, 28);
    strokeWeight(7);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 150);
    noStroke();
    fill(210, 165, 90);
    rect(flagpole.x_pos - 44, floorPos_y - 145, 88, 34, 5);
    fill(100, 62, 31);
    textAlign(CENTER);
    textSize(15);
    text("FINISH", flagpole.x_pos, floorPos_y - 122);
    textAlign(LEFT);
    fill(245, 72, 52);
    if(flagpole.isReached)
    {
        triangle(flagpole.x_pos, floorPos_y - 150, flagpole.x_pos + 72, floorPos_y - 130, flagpole.x_pos, floorPos_y - 108);
    }
    else
    {
        triangle(flagpole.x_pos, floorPos_y - 40, flagpole.x_pos + 72, floorPos_y - 20, flagpole.x_pos, floorPos_y + 2);
    }
}

function drawGameChar()
{
    noStroke();
    fill(45, 45, 55);
    rect(gameChar_world_x - 17, gameChar_y - 19, 13, 19, 3);
    rect(gameChar_world_x + 4, gameChar_y - 19, 13, 19, 3);
    fill(28, 83, 175);
    rect(gameChar_world_x - 18, gameChar_y - 53, 36, 38, 6);
    fill(49, 115, 220);
    rect(gameChar_world_x - 13, gameChar_y - 50, 26, 25, 4);
    fill(255, 215, 176);
    rect(gameChar_world_x - 15, gameChar_y - 83, 30, 31, 6);
    fill(94, 53, 27);
    rect(gameChar_world_x - 16, gameChar_y - 88, 32, 12, 6);
    rect(gameChar_world_x - 12, gameChar_y - 94, 20, 12, 5);
    fill(255);
    ellipse(gameChar_world_x - 6, gameChar_y - 68, 4, 5);
    ellipse(gameChar_world_x + 6, gameChar_y - 68, 4, 5);
}

function updateGameChar()
{
    gameChar_world_x = gameChar_x - scrollPos;
    moveGameChar();
    checkCanyons();
    applyGravity();
    checkApples();
    checkFlagpole();
}

function jump()
{
    if(!isPlummeting && (gameChar_y >= floorPos_y || isOnPlatform))
    {
        gameChar_y = min(gameChar_y, floorPos_y);
        gameChar_velocity_y = -14;
        isFalling = true;
        isOnPlatform = false;
        jumpSound.play();
    }
}

function moveGameChar()
{
    if(isLeft && !isPlummeting)
    {
        if(gameChar_x > width * 0.4)
        {
            gameChar_x -= 5;
        }
        else
        {
            scrollPos += 5;
        }
    }
    if(isRight && !isPlummeting)
    {
        if(gameChar_x < width * 0.6)
        {
            gameChar_x += 5;
        }
        else
        {
            scrollPos -= 5;
        }
    }
    gameChar_world_x = gameChar_x - scrollPos;
}

function applyGravity()
{
    var i;

    // A canyon fall is deliberately slower than a normal jump or fall.
    if(isPlummeting)
    {
        gameChar_y += 2;
        isFalling = true;
        return;
    }

    isOnPlatform = false;
    for(i = 0; i < platforms.length; i++)
    {
        if(gameChar_velocity_y >= 0 && platforms[i].checkContact(gameChar_world_x, gameChar_y))
        {
            isOnPlatform = true;
            gameChar_y = platforms[i].y_pos;
            gameChar_velocity_y = 0;
        }
    }

    // Only land on the ground while falling. This lets a negative velocity
    // move the character upward when the Space bar starts a jump.
    if(!isPlummeting && !isOnPlatform && gameChar_y >= floorPos_y && gameChar_velocity_y >= 0)
    {
        gameChar_y = floorPos_y;
        gameChar_velocity_y = 0;
        isFalling = false;
    }
    else if(!isOnPlatform)
    {
        gameChar_velocity_y += 0.7;
        gameChar_y += gameChar_velocity_y;
        isFalling = true;
    }
}

function checkCanyons()
{
    var i;

    if(gameChar_y !== floorPos_y)
    {
        return;
    }

    for(i = 0; i < canyons.length; i++)
    {
        if(gameChar_world_x > canyons[i].x_pos && gameChar_world_x < canyons[i].x_pos + canyons[i].width)
        {
            isPlummeting = true;
            isLeft = false;
            isRight = false;
            backgroundMusic.stop();
            fallSound.play();
        }
    }
}

function checkApples()
{
    var i;

    for(i = 0; i < apples.length; i++)
    {
        if(!apples[i].isFound && dist(gameChar_world_x, gameChar_y - 35, apples[i].x_pos, apples[i].y_pos) < 32)
        {
            apples[i].isFound = true;
            game_score += 1;
        }
    }
}

function checkFlagpole()
{
    if(abs(gameChar_world_x - flagpole.x_pos) < 25)
    {
        flagpole.isReached = true;
        levelComplete = true;
    }
}

function loseLife()
{
    lives -= 1;
    if(lives > 0)
    {
        startGame();
    }
    else
    {
        gameOver = true;
    }
}

function drawHud()
{
    noStroke();
    fill(25, 55, 78, 220);
    rect(20, 20, 210, 55, 12);
    rect(20, 85, 210, 55, 12);
    fill(235, 40, 35);
    ellipse(50, 47, 28, 28);
    fill(255, 145, 135);
    ellipse(44, 41, 6, 7);
    fill(255, 60, 70);
    ellipse(48, 108, 19, 24);
    ellipse(63, 108, 19, 24);
    triangle(39, 112, 72, 112, 55, 130);
    fill(255);
    textStyle(BOLD);
    textSize(23);
    text("Apples: " + game_score, 82, 55);
    text("Lives: " + lives, 82, 120);
    textStyle(NORMAL);
    noStroke();
}

function drawEndMessage(title, subtitle)
{
    fill(0, 150);
    rect(0, 0, width, height);
    textAlign(CENTER);
    fill(255);
    textSize(48);
    text(title, width / 2, height / 2 - 15);
    textSize(22);
    text(subtitle, width / 2, height / 2 + 30);
    textAlign(LEFT);
}

function keyPressed()
{

    if(!backgroundMusic.isPlaying())
    {
        backgroundMusic.setVolume(0.2);
        backgroundMusic.loop();
    }

    if((gameOver || levelComplete) && keyCode === ENTER)
    {
        lives = 3;
        startGame();
        return;
    }

    if(keyCode === LEFT_ARROW)
    {
        isLeft = true;
    }
    if(keyCode === RIGHT_ARROW)
    {
        isRight = true;
    }
    if(key === ' ' || keyCode === 32)
    {
        jump();
        return false;
    }
}

function keyReleased()
{
    if(keyCode === LEFT_ARROW)
    {
        isLeft = false;
    }
    if(keyCode === RIGHT_ARROW)
    {
        isRight = false;
    }
}
