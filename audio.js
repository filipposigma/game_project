// --------------------------------------------------
// AUDIO
// --------------------------------------------------

import {game} from './game.js';

export const audioState = {
    jumpSound: null,
    backgroundMusic: null,
    fallSound: null,
    fallSoundPlayed: false,
    levelCompleteSound: null,
    gameOverSound: null,
    itemCollectSound: null,
    suppressMusicForFall: false,
    suppressMusicForGameOver: false
};

export function preloadSounds() {
    soundFormats("mp3", "wav");

    audioState.jumpSound = loadSound(
        "assets/jump.wav",
        () => {},
        () => { audioState.jumpSound = null; }
    );

    audioState.fallSound = loadSound(
        "assets/fall.wav",
        () => { audioState.fallSound.onended(onFallSoundEnded); },
        () => { audioState.fallSound = null; }
    );

    audioState.backgroundMusic = loadSound(
        "assets/background-music.mp3",
        () => {},
        () => { audioState.backgroundMusic = null; }
    );

    audioState.levelCompleteSound = loadSound(
        "assets/level_complete.mp3",
        () => {},
        () => { audioState.levelCompleteSound = null; }
    );

    audioState.itemCollectSound = loadSound(
        "assets/item_collect.mp3",
        () => { audioState.itemCollectSound.setVolume(2); },
        () => { audioState.itemCollectSound = null; }
    );

    audioState.gameOverSound = loadSound(
        "assets/game_over.mp3",
        () => { audioState.gameOverSound.onended(onGameOverSoundEnded); },
        () => { audioState.gameOverSound = null; }
    );
}

export function startBackgroundMusic() {
    const music = audioState.backgroundMusic;

    if (music && music.isLoaded() && !music.isPlaying()) {
        music.loop();
    }
}

export function stopBackgroundMusic() {
    const music = audioState.backgroundMusic;

    if (music && music.isPlaying()) {
        music.stop();
    }
}

export function onFallSoundEnded() {
    audioState.suppressMusicForFall = false;

    if (!game.gameOver && !game.levelComplete) {
        startBackgroundMusic();
    }
}

export function onGameOverSoundEnded() {
    audioState.suppressMusicForGameOver = false;

    if (!game.gameOver && !game.levelComplete) {
        startBackgroundMusic();
    }
}

export function attemptStartBackgroundMusic(isPlummeting) {
    if (game.gameOver || game.levelComplete || isPlummeting) {
        return;
    }

    if (audioState.suppressMusicForFall || audioState.suppressMusicForGameOver) {
        return;
    }

    if (audioState.fallSound && audioState.fallSound.isPlaying()) {
        return;
    }

    if (audioState.gameOverSound && audioState.gameOverSound.isPlaying()) {
        return;
    }

    startBackgroundMusic();
}

export function playFallSound() {
    const fall = audioState.fallSound;

    if (!audioState.fallSoundPlayed && fall && fall.isLoaded()) {
        audioState.fallSoundPlayed = true;
        audioState.suppressMusicForFall = true;

        if (fall.isPlaying()) {
            fall.stop();
        }

        fall.play();
    } else {
        audioState.suppressMusicForFall = false;
    }
}

export function playGameOverSound() {
    const gameOverSound = audioState.gameOverSound;

    if (gameOverSound && gameOverSound.isLoaded()) {
        audioState.suppressMusicForGameOver = true;

        if (gameOverSound.isPlaying()) {
            gameOverSound.stop();
        }

        gameOverSound.play();
    } else {
        audioState.suppressMusicForGameOver = false;
    }
}

export function playItemCollectSound() {
    const item = audioState.itemCollectSound;

    if (item && item.isLoaded()) {
        item.stop();
        item.play();
    }
}

export function playLevelCompleteSound() {
    const levelSound = audioState.levelCompleteSound;

    if (levelSound && levelSound.isLoaded()) {
        levelSound.stop();
        levelSound.play();
    }
}

export function playJumpSound() {
    const jumpSound = audioState.jumpSound;

    if (jumpSound && jumpSound.isLoaded()) {
        jumpSound.stop();
        jumpSound.play();
    }
}

export function resetOneShotSounds() {
    audioState.fallSoundPlayed = false;
    audioState.suppressMusicForFall = false;
    audioState.suppressMusicForGameOver = false;

    if (audioState.levelCompleteSound && audioState.levelCompleteSound.isPlaying()) {
        audioState.levelCompleteSound.stop();
    }

    if (audioState.itemCollectSound && audioState.itemCollectSound.isPlaying()) {
        audioState.itemCollectSound.stop();
    }

    if (audioState.gameOverSound && audioState.gameOverSound.isPlaying()) {
        audioState.gameOverSound.stop();
    }
}