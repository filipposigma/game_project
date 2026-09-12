// --------------------------------------------------
// ENEMIES
// --------------------------------------------------

import {world} from './world.js';
import {canyons} from './level.js';

export let enemies = [];
let enemySpawnTimer = 0;

export function resetEnemies() {
    enemies = [];
    enemySpawnTimer = 0;
}

function isOverCanyon(x) {
    for (const canyon of canyons) {
        if (x > canyon.xPos && x < canyon.xPos + canyon.width) {
            return true;
        }
    }

    return false;
}

export function Turtle(xPos, direction) {
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
    const screenX = this.xPos + world.scrollPos;
    return screenX < -100 || screenX > width + 100;
};

Turtle.prototype.draw = function() {
    push();

    translate(this.xPos, world.floorPosY);
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

export function spawnEnemy() {
    const spawnFromLeft = random() < 0.5;
    const screenEdgeX = spawnFromLeft ? -30 : width + 30;
    const direction = spawnFromLeft ? 1 : -1;

    enemies.push(new Turtle(screenEdgeX - world.scrollPos, direction));
}

export function updateEnemies() {
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

export function drawEnemies() {
    for (const enemy of enemies) {
        enemy.draw();
    }
}