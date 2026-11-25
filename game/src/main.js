// Boot, canvas scaling, query parameters (?seed=N and ?shot=cover|prep|plate|title),
// the fixed-step loop and the best-score shelf.

import { BEST_KEY, FIELD, STEP } from './config.js';
import { createGame } from './game.js';
import { createInput } from './input.js';
import { drawWorld } from './render.js';
import { drawHud } from './hud.js';
import { stageShot } from './shots.js';
import { audio } from './audio.js';

const params = new URLSearchParams(window.location.search);
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  canvas.style.width = `${Math.floor(FIELD.width * scale)}px`;
  canvas.style.height = `${Math.floor(FIELD.height * scale)}px`;
}

function announce(message) {
  if (status) status.textContent = message;
}

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private windows simply forget the best score.
  }
}

function runShot(name) {
  stageShot(name, game.state, seed);
  game.state.best = readBest();
  let frames = 0;
  function paint() {
    drawWorld(ctx, game.state);
    drawHud(ctx, game.state);
    frames += 1;
    if (frames < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  document.title = `Wok Luck — ${name}`;
  requestAnimationFrame(paint);
}

const game = createGame(seed);
fitCanvas();
window.addEventListener('resize', fitCanvas);

if (shot) {
  runShot(shot);
} else {
  const input = createInput(canvas);
  let best = readBest();
  game.state.best = best;
  let accumulator = 0;
  let last = performance.now();
  let lastScreen = game.state.screen;
  let saved = false;

  function start() {
    game.begin();
    accumulator = 0;
    saved = false;
    best = Math.max(best, readBest());
    game.state.best = best;
    announce('Wok Luck. Shift one. Three tickets live.');
  }

  function handleGlobalKeys() {
    if (input.pressed('KeyM')) {
      game.state.muted = !game.state.muted;
      audio.setMuted(game.state.muted);
      announce(game.state.muted ? 'Muted.' : 'Sound on.');
    }
    if (game.state.screen === 'title' || game.state.screen === 'end') {
      if (input.pressed('Enter') || input.pressed('Space')) start();
      return;
    }
    if (input.pressed('KeyP') || input.pressed('Escape')) {
      if (game.state.paused) {
        game.state.paused = false;
        announce('Back to the wok.');
      } else {
        game.state.paused = true;
        announce('Paused.');
      }
    }
    if (game.state.paused && input.pressed('Enter')) {
      game.state.paused = false;
      announce('Back to the wok.');
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min(0.25, (now - last) / 1000);
    last = now;

    handleGlobalKeys();
    if (game.state.screen === 'play' && !game.state.paused) {
      let steps = 0;
      while (accumulator >= STEP && steps < 6) {
        game.update(STEP, input);
        accumulator -= STEP;
        steps += 1;
      }
    } else {
      accumulator = 0;
    }

    if (game.state.screen === 'end' && !saved) {
      saved = true;
      if (game.state.score > best) {
        best = game.state.score;
        saveBest(best);
      }
      game.state.best = best;
      announce(`Shift over. Score ${game.state.score}. Served ${game.state.served}.`);
    }

    if (game.state.screen !== lastScreen) {
      lastScreen = game.state.screen;
      if (game.state.screen === 'title') announce('Wok Luck. Press Enter to open the stall.');
    }

    input.endFrame();
    drawWorld(ctx, game.state);
    drawHud(ctx, game.state);
  }

  announce('Wok Luck. Press Enter to open the stall.');
  requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state.screen === 'play') {
    game.state.paused = true;
    announce('Paused.');
  }
});
