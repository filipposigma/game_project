// --------------------------------------------------
// LEVEL
// --------------------------------------------------

import { world } from './world.js';

export let treesX = [];
export let clouds = [];
export let mountains = [];
export let canyons = [];
export let stars = [];
export let platforms = [];
export let flagpole = { xPos: 0, isReached: false };

// --------------------------------------------------
// PLATFORM FACTORY
// --------------------------------------------------

export const createPlatform = (x, y, length) => ({ x, y, length });

// --------------------------------------------------
// LEVEL SETUP
// --------------------------------------------------

export function initialiseLevel() {
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
        { xPos: 260, width: 100 },
        { xPos: 800, width: 100 },
        { xPos: 1340, width: 100 },
        { xPos: 1900, width: 100 }
    ];

    mountains = [
        { xPos: -500, height: 250 },
        { xPos: 430, height: 220 },
        { xPos: 960, height: 285 },
        { xPos: 1500, height: 240 },
        { xPos: 2100, height: 275 }
    ];

    stars = [
        { xPos: 100, yPos: world.floorPosY - 25, isFound: false },
        { xPos: 470, yPos: world.floorPosY - 145, isFound: false },
        { xPos: 735, yPos: world.floorPosY - 25, isFound: false },
        { xPos: 1065, yPos: world.floorPosY - 165, isFound: false },
        { xPos: 1560, yPos: world.floorPosY - 130, isFound: false },
        { xPos: 2140, yPos: world.floorPosY - 190, isFound: false },
        { xPos: 2390, yPos: world.floorPosY - 25, isFound: false },
        { xPos: 2360, yPos: world.floorPosY - 125, isFound: false },
        { xPos: 2520, yPos: world.floorPosY - 225, isFound: false }
    ];

    platforms = [
        createPlatform(450, world.floorPosY - 100, 50),
        createPlatform(990, world.floorPosY - 120, 70),
        createPlatform(1500, world.floorPosY - 90, 50),
        createPlatform(2070, world.floorPosY - 145, 70),
        createPlatform(2250, world.floorPosY - 50, 60),
        createPlatform(2330, world.floorPosY - 100, 60),
        createPlatform(2410, world.floorPosY - 150, 60)
    ];

    flagpole = {
        xPos: 2600,
        isReached: false
    };
}

export function resetStars() {
    for (const star of stars) {
        star.isFound = false;
    }
}

// --------------------------------------------------
// SKY
// --------------------------------------------------

export function drawSky() {
    background(75, 143, 245);
}

// --------------------------------------------------
// TREES
// --------------------------------------------------

export function drawTrees() {
    for (const treeX of treesX) {
        noStroke();

        fill(39, 128, 7);
        rect(treeX - 45, world.floorPosY - 85, 30, 30);
        rect(treeX - 60, world.floorPosY - 55, 45, 30);
        rect(treeX + 30, world.floorPosY - 70, 30, 45);
        rect(treeX - 30, world.floorPosY - 105, 60, 30);

        fill(100, 205, 10);
        rect(treeX - 30, world.floorPosY - 95, 60, 30);
        rect(treeX - 45, world.floorPosY - 65, 90, 45);
        rect(treeX - 60, world.floorPosY - 25, 120, 30);

        fill(140, 225, 20);
        rect(treeX - 30, world.floorPosY - 95, 30, 20);
        rect(treeX - 45, world.floorPosY - 65, 35, 20);
        rect(treeX + 15, world.floorPosY - 35, 30, 15);

        fill(143, 78, 25);
        rect(treeX - 18, world.floorPosY - 5, 36, 30);

        fill(180, 92, 28);
        rect(treeX - 12, world.floorPosY - 5, 15, 30);
    }
}

// --------------------------------------------------
// GROUND
// --------------------------------------------------

export function drawGround() {
    noStroke();

    fill(211, 91, 12);
    rect(-2000, world.floorPosY, 6000, height - world.floorPosY);

    fill(235, 117, 14);
    rect(-2000, world.floorPosY, 6000, 7);

    fill(121, 54, 18);

    for (let x = -1900; x < 4000; x += 90) {
        rect(x, world.floorPosY + 35, 18, 5);
        rect(x + 40, world.floorPosY + 75, 12, 4);
        rect(x + 70, world.floorPosY + 110, 20, 5);
    }

    fill(145, 60, 16);

    for (let x = -1800; x < 4000; x += 150) {
        rect(x, world.floorPosY + 55, 10, 5);
        rect(x + 75, world.floorPosY + 92, 15, 5);
    }
}

// --------------------------------------------------
// MOUNTAINS
// --------------------------------------------------

export function drawMountains() {
    noStroke();

    for (const mountain of mountains) {
        const mountainWidth = 260;

        fill(111, 143, 134);
        triangle(mountain.xPos, world.floorPosY, mountain.xPos + mountainWidth / 2, world.floorPosY - mountain.height, mountain.xPos + mountainWidth, world.floorPosY);

        fill(174, 198, 188);
        triangle(mountain.xPos + mountainWidth / 2, world.floorPosY - mountain.height, mountain.xPos + mountainWidth * 0.64, world.floorPosY - mountain.height * 0.55, mountain.xPos + mountainWidth, world.floorPosY);

        fill(91, 123, 116);
        triangle(mountain.xPos, world.floorPosY, mountain.xPos + mountainWidth / 2, world.floorPosY - mountain.height, mountain.xPos + mountainWidth * 0.38, world.floorPosY);
    }
}

// --------------------------------------------------
// CLOUDS
// --------------------------------------------------

export function drawClouds() {
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

export function drawCanyons() {
    for (const canyon of canyons) {
        noStroke();
        fill(75, 143, 245);
        rect(canyon.xPos, world.floorPosY, canyon.width, height - world.floorPosY);
    }
}

// --------------------------------------------------
// COLLECTABLE STARS
// --------------------------------------------------

export function drawStars() {
    for (const star of stars) {
        if (!star.isFound) {
            drawCollectableStar(star.xPos, star.yPos);
        }
    }
}

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
// DRAW PLATFORMS
// --------------------------------------------------

export function drawPlatforms() {
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

export function drawFlagpole() {
    stroke(45, 45, 45);
    strokeWeight(8);
    line(flagpole.xPos, world.floorPosY, flagpole.xPos, world.floorPosY - 180);

    stroke(90, 90, 90);
    strokeWeight(3);
    line(flagpole.xPos - 1, world.floorPosY, flagpole.xPos - 1, world.floorPosY - 180);

    noStroke();

    fill(245, 48, 27);
    triangle(flagpole.xPos, world.floorPosY - 175, flagpole.xPos + 70, world.floorPosY - 150, flagpole.xPos, world.floorPosY - 125);

    fill(255, 63, 36);
    triangle(flagpole.xPos + 2, world.floorPosY - 170, flagpole.xPos + 55, world.floorPosY - 151, flagpole.xPos + 2, world.floorPosY - 140);

    fill(255);
    textFont("Courier New");
    textSize(13);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("FINISH", flagpole.xPos + 28, world.floorPosY - 150);
    textAlign(LEFT, BASELINE);
}