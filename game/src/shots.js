// Deterministic screenshot staging. Each scene sets up a real, valid game state and
// then the normal renderer paints it; nothing is composited or pasted afterwards.

import {
  addParticles, addSteam, makeRandom, recipeById,
} from './state.js';

function ticket(state, recipeId, slot, patience, maxPatience, extra = {}) {
  const recipe = recipeById(recipeId);
  const item = {
    id: state.nextTicket,
    recipeId,
    slot,
    patience,
    maxPatience,
    payout: recipe.payout,
    status: 'live',
    hold: 0,
    age: 2,
    stamp: 0,
    rejected: 0,
    highlight: false,
  };
  state.nextTicket += 1;
  Object.assign(item, extra);
  return item;
}

function clear(state) {
  state.particles.length = 0;
  state.popups.length = 0;
  state.shake = 0;
  state.flash = 0;
  state.servedFlash = 0;
  state.toast = null;
  state.paused = false;
  state.mouseStir = false;
  state.cooldowns = [0, 0, 0];
}

function stageCover(state, random) {
  state.screen = 'play';
  state.shift = 47;
  state.time = 14.2;
  state.score = 1840;
  state.combo = 4;
  state.bestCombo = 5;
  state.served = 9;
  state.lost = 1;
  state.perfect = 4;
  state.shiftNumber = 3;
  state.nextTicket = 7;
  state.tickets = [
    ticket(state, 'midnight', 0, 26, 56, { id: 6 }),
    ticket(state, 'fried-rice', 1, 41, 58, { id: 4 }),
    ticket(state, 'chili-egg', 2, 13, 52, { id: 7 }),
  ];
  state.bowl = {
    ingredients: ['noodles', 'greens', 'chili'],
    chopped: true,
    chopQuality: 0.92,
    chopping: false,
    chopNeedle: 0.68,
    chopDir: 1,
    heat: 0.63,
    cooked: false,
    cookQuality: 0,
    burnt: false,
    stir: true,
  };
  state.plate = { recipeId: 'midnight', quality: 0.88, garnish: '#57c785', age: 1.2, shine: 1 };
  state.chef = {
    x: 676, y: 452, vx: 0, vy: 0, face: 1, walk: 1.4, squash: 1,
    swing: 0.2, stirT: 3.1, target: null, pending: null,
  };
  state.prompt = { text: 'RELEASE E — in the green!', tone: 'hot' };
  state.mouseStir = true;
  addSteam(state, 1088, 342, 7, random);
  addSteam(state, 694, 300, 5, random);
  addParticles(state, 694, 320, 9, 'spark', {
    color: '#ffc36a', speed: 95, size: 2.6, life: 0.55, gravity: 30, spread: 2.6, random,
  });
  addParticles(state, 452, 322, 7, 'bit', {
    color: '#8fd6a4', speed: 55, size: 3, life: 0.5, gravity: 180, spread: 2.2, random,
  });
}

function stagePrep(state, random) {
  state.screen = 'play';
  state.shift = 61;
  state.time = 12.7;
  state.score = 920;
  state.combo = 2;
  state.bestCombo = 3;
  state.served = 4;
  state.lost = 0;
  state.perfect = 2;
  state.shiftNumber = 2;
  state.nextTicket = 8;
  state.tickets = [
    ticket(state, 'fried-rice', 0, 47, 58, { highlight: true, id: 8 }),
    ticket(state, 'garden', 1, 34, 54, { id: 5 }),
    ticket(state, 'midnight', 2, 22, 56, { id: 3 }),
  ];
  state.bowl = {
    ingredients: ['rice', 'egg', 'greens'],
    chopped: false,
    chopQuality: 0,
    chopping: true,
    chopNeedle: 0.66,
    chopDir: 1,
    heat: 0,
    cooked: false,
    cookQuality: 0,
    burnt: false,
    stir: false,
  };
  state.plate = null;
  state.chef = {
    x: 448, y: 424, vx: 0, vy: 0, face: 1, walk: 0.6, squash: 0.94,
    swing: 0.95, stirT: 0, target: null, pending: null,
  };
  state.prompt = { text: 'SPACE — stop in the green', tone: 'hot' };
  addParticles(state, 452, 324, 14, 'bit', {
    color: '#f2e3bd', speed: 110, size: 3.2, life: 0.55, gravity: 260, spread: 2.4, random,
  });
  addParticles(state, 452, 324, 8, 'bit', {
    color: '#57c785', speed: 90, size: 3, life: 0.5, gravity: 240, spread: 2.2, random,
  });
  addSteam(state, 694, 292, 3, random);
}

function stagePlate(state, random) {
  state.screen = 'play';
  state.shift = 34;
  state.time = 16.8;
  state.score = 2210;
  state.combo = 6;
  state.bestCombo = 6;
  state.served = 12;
  state.lost = 1;
  state.perfect = 6;
  state.shiftNumber = 4;
  state.nextTicket = 12;
  state.tickets = [
    ticket(state, 'garden', 0, 36, 54, { id: 11 }),
    ticket(state, 'midnight', 1, 20, 56, { id: 9 }),
    ticket(state, 'chili-egg', 2, 31, 52, { highlight: true, id: 12 }),
  ];
  state.bowl = {
    ingredients: ['rice', 'greens', 'chili'],
    chopped: true,
    chopQuality: 0.86,
    chopping: false,
    chopNeedle: 0.31,
    chopDir: 1,
    heat: 0.18,
    cooked: false,
    cookQuality: 0,
    burnt: false,
    stir: false,
  };
  state.plate = { recipeId: 'chili-egg', quality: 0.95, garnish: '#ffd75e', age: 1.8, shine: 1 };
  state.chef = {
    x: 964, y: 560, vx: 0, vy: 0, face: 1, walk: 0.2, squash: 1,
    swing: 0, stirT: 0, target: null, pending: null,
  };
  state.prompt = { text: 'E — serve Chili Egg Noodles', tone: 'go' };
  addSteam(state, 1088, 342, 8, random);
  addParticles(state, 1088, 348, 8, 'spark', {
    color: '#fff3c9', speed: 50, size: 2, life: 0.5, gravity: 0, spread: 2.4, random,
  });
  addParticles(state, 1092, 500, 5, 'spark', {
    color: '#ffd784', speed: 45, size: 2, life: 0.5, gravity: 0, spread: 2, random,
  });
}

function stageTitle(state, random) {
  state.screen = 'title';
  state.time = 2.2;
  state.shift = 90;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.shiftNumber = 1;
  state.nextTicket = 4;
  state.tickets = [
    ticket(state, 'midnight', 0, 54, 56, { id: 1, age: 4 }),
    ticket(state, 'fried-rice', 1, 48, 58, { id: 2, age: 4 }),
    ticket(state, 'garden', 2, 42, 54, { id: 3, age: 4 }),
  ];
  state.bowl = {
    ingredients: [],
    chopped: false,
    chopQuality: 0,
    chopping: false,
    chopNeedle: 0.2,
    chopDir: 1,
    heat: 0,
    cooked: false,
    cookQuality: 0,
    burnt: false,
    stir: false,
  };
  state.plate = null;
  state.chef = {
    x: 622, y: 500, vx: 0, vy: 0, face: 1, walk: 0.4, squash: 1,
    swing: 0, stirT: 0, target: null, pending: null,
  };
  state.prompt = { text: 'WASD — walk the kitchen', tone: 'idle' };
  addSteam(state, 694, 292, 4, random);
  addParticles(state, 694, 320, 4, 'spark', {
    color: '#ffc36a', speed: 60, size: 2.2, life: 0.5, gravity: 0, spread: 2, random,
  });
}

export function stageShot(name, state, seed = 7) {
  const random = makeRandom((seed >>> 0) * 131 + name.length * 17 + 3);
  clear(state);
  state.seed = seed;
  if (name === 'prep') stagePrep(state, random);
  else if (name === 'plate') stagePlate(state, random);
  else if (name === 'title') stageTitle(state, random);
  else stageCover(state, random);
  return state.screen;
}
