// --------------------------------------------------
// GAME STATE
// --------------------------------------------------

export const game = {
    score: 0,
    lives: 3,
    gameOver: false,
    levelComplete: false,
    time: 0,
    startTime: 0
};

export function resetGameState() {
    game.score = 0;
    game.lives = 3;
    game.gameOver = false;
    game.levelComplete = false;
    game.time = 0;
    game.startTime = millis();
}

export function updateTimer() {
    game.time = floor((millis() - game.startTime) / 1000);
}