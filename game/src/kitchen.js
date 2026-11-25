// Stations and rules: pantry crates, chopping meter, wok heat, plating and serving.
// Every action also works by clicking a station, which walks the chef over first.

import {
  CRATE, CRATE_CENTERS, INGREDIENTS, STATIONS, TIMINGS,
} from './config.js';
import {
  addParticles, addPopup, addSteam, chefDistance, matchBowl,
  recipeById, setToast,
} from './state.js';
import { chefNear, sendChefTo } from './chef.js';
import { audio } from './audio.js';

const HITS = {
  crates: INGREDIENTS.map((item, index) => ({
    kind: 'crate', index, id: item.id,
    x: CRATE.x0 + index * CRATE.gap, y: CRATE.y, w: CRATE.w, h: CRATE.h,
    target: { x: CRATE_CENTERS[index].x, y: CRATE.frontY },
  })),
  board: { kind: 'board', x: 392, y: 292, w: 132, h: 108, target: { x: STATIONS.board.x, y: 430 } },
  wok: { kind: 'wok', x: 612, y: 270, w: 166, h: 130, target: { x: STATIONS.wok.x, y: 430 } },
  trash: { kind: 'trash', x: 824, y: 492, w: 92, h: 108, target: { x: STATIONS.trash.x, y: 548 } },
  pass: { kind: 'pass', x: 976, y: 300, w: 232, h: 190, target: { x: STATIONS.pass.x, y: 470 } },
  hatch: { kind: 'hatch', x: 994, y: 492, w: 214, h: 126, target: { x: STATIONS.hatch.x, y: 556 } },
};

function pantryCrate(state) {
  let best = null;
  let bestDistance = Infinity;
  CRATE_CENTERS.forEach((point, index) => {
    const distance = Math.hypot(state.chef.x - point.x, (state.chef.y - 60) - point.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  if (bestDistance > 150) return null;
  return { kind: 'crate', index: best, point: CRATE_CENTERS[best] };
}

export function nearestStation(state) {
  if (state.bowl.chopping && chefNear(state, STATIONS.board, 20)) {
    return { kind: 'board', point: STATIONS.board };
  }
  const candidates = [
    { kind: 'board', point: STATIONS.board },
    { kind: 'wok', point: STATIONS.wok },
    { kind: 'trash', point: STATIONS.trash },
    { kind: 'pass', point: STATIONS.pass },
    { kind: 'hatch', point: STATIONS.hatch },
  ];
  let best = null;
  let bestDistance = Infinity;
  candidates.forEach((candidate) => {
    const distance = chefDistance(state, candidate.point);
    if (distance <= (candidate.point.radius ?? 120) && distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  });
  const crate = pantryCrate(state);
  if (crate) {
    const distance = chefDistance(state, crate.point);
    if (distance < bestDistance) best = crate;
  }
  return best;
}

export function currentPrompt(state) {
  const near = nearestStation(state);
  if (!near) return { text: 'WASD — walk the kitchen', tone: 'idle' };
  const bowl = state.bowl;
  const recipe = matchBowl(bowl);

  if (near.kind === 'crate') {
    const ingredient = INGREDIENTS[near.index];
    if (bowl.cooked || bowl.burnt) return { text: 'E — that bowl is finished', tone: 'warn' };
    if (bowl.ingredients.length >= TIMINGS.maxBowl) return { text: 'E — the bowl is full', tone: 'warn' };
    return { text: `E — add ${ingredient.label.toLowerCase()}`, tone: 'go' };
  }

  if (near.kind === 'board') {
    if (bowl.chopping) return { text: 'SPACE — stop in the green', tone: 'hot' };
    if (bowl.burnt) return { text: 'E — burnt bowl, use the bin', tone: 'warn' };
    if (bowl.cooked) return { text: 'WASD — plate it at the pass', tone: 'go' };
    if (bowl.ingredients.length === 0) return { text: 'WASD — fill your bowl at the pantry', tone: 'idle' };
    if (!recipe) return { text: 'E — not a recipe, use the bin', tone: 'warn' };
    if (bowl.chopped) return { text: 'WASD — take the bowl to the wok', tone: 'go' };
    return { text: 'SPACE — chop', tone: 'go' };
  }

  if (near.kind === 'wok') {
    if (bowl.burnt) return { text: 'E — burnt! trash it', tone: 'warn' };
    if (bowl.cooked) return { text: 'WASD — plate it at the pass', tone: 'go' };
    if (bowl.ingredients.length === 0) return { text: 'WASD — fill your bowl first', tone: 'idle' };
    if (!recipe) return { text: 'E — not a recipe, use the bin', tone: 'warn' };
    if (!bowl.chopped) return { text: 'WASD — chop at the board first', tone: 'warn' };
    if (bowl.stir || state.mouseStir) {
      if (bowl.heat < TIMINGS.heatGreen[0]) return { text: 'HOLD E — stir to the green', tone: 'hot' };
      if (bowl.heat > TIMINGS.heatGreen[1]) return { text: 'RELEASE E — now!', tone: 'hot' };
      return { text: 'RELEASE E — in the green!', tone: 'hot' };
    }
    return { text: 'HOLD E — stir the wok', tone: 'go' };
  }

  if (near.kind === 'pass') {
    if (state.plate) return { text: 'WASD — take the plate to the hatch', tone: 'idle' };
    if (bowl.cooked && !bowl.burnt) return { text: 'E — plate the dish', tone: 'go' };
    if (bowl.burnt) return { text: 'E — burnt bowl, use the bin', tone: 'warn' };
    return { text: 'HOLD E — cook it in the wok first', tone: 'idle' };
  }

  if (near.kind === 'hatch') {
    if (!state.plate) return { text: 'WASD — plate a dish first', tone: 'idle' };
    return { text: `E — serve ${recipeById(state.plate.recipeId).name}`, tone: 'go' };
  }

  if (near.kind === 'trash') {
    if (bowl.ingredients.length === 0 && !bowl.burnt) return { text: 'E — nothing to trash', tone: 'idle' };
    return { text: 'E — trash the bowl', tone: 'warn' };
  }
  return { text: 'WASD — walk the kitchen', tone: 'idle' };
}

function addIngredient(state, index) {
  const bowl = state.bowl;
  const ingredient = INGREDIENTS[index];
  if (bowl.cooked || bowl.burnt) {
    setToast(state, 'That bowl is finished — plate it or bin it', '#ffb347');
    audio.error();
    return;
  }
  if (bowl.ingredients.length >= TIMINGS.maxBowl) {
    setToast(state, 'Bowl full — four ingredients max', '#ffb347');
    audio.error();
    return;
  }
  bowl.ingredients.push(ingredient.id);
  bowl.chopped = false;
  bowl.chopQuality = 0;
  bowl.heat = 0;
  bowl.cooked = false;
  bowl.cookQuality = 0;
  bowl.burnt = false;
  const point = CRATE_CENTERS[index];
  addParticles(state, point.x, CRATE.y + CRATE.h - 10, 7, 'bit', {
    color: ingredient.color, speed: 90, size: 3, life: 0.5, gravity: 300,
  });
  addPopup(state, `+ ${ingredient.label.toLowerCase()}`, point.x, CRATE.y - 8, ingredient.color, 13);
  audio.pop();
}

function startChop(state) {
  const bowl = state.bowl;
  if (bowl.chopping) return;
  if (bowl.ingredients.length === 0) {
    setToast(state, 'Fill your bowl at the pantry first', '#ffb347');
    audio.error();
    return;
  }
  if (bowl.cooked || bowl.burnt) {
    setToast(state, 'That bowl is already finished', '#ffb347');
    audio.error();
    return;
  }
  if (bowl.chopped) {
    setToast(state, 'Already chopped — take it to the wok', '#8fe0b0');
    return;
  }
  if (!matchBowl(bowl)) {
    setToast(state, 'That combination is not a recipe', '#ffb347');
    audio.error();
    return;
  }
  bowl.chopping = true;
  bowl.chopNeedle = 0.12;
  bowl.chopDir = 1;
  state.chef.swing = 1;
  audio.chop();
}

function resolveChop(state) {
  const bowl = state.bowl;
  if (!bowl.chopping) return;
  bowl.chopping = false;
  const [lo, hi] = TIMINGS.chopGreen;
  if (bowl.chopNeedle >= lo && bowl.chopNeedle <= hi) {
    const centre = (lo + hi) / 2;
    bowl.chopped = true;
    bowl.chopQuality = Math.max(0, 1 - Math.abs(bowl.chopNeedle - centre) / ((hi - lo) / 2));
    addParticles(state, 452, 330, 12, 'bit', {
      color: '#8fd6a4', speed: 160, size: 3.4, life: 0.65, gravity: 380, spread: 2.4,
    });
    addParticles(state, 452, 330, 6, 'spark', {
      color: '#ffd784', speed: 120, size: 2.6, life: 0.4, gravity: 0,
    });
    addPopup(state, bowl.chopQuality > 0.72 ? 'PERFECT CHOP' : 'CHOPPED', 452, 284, '#9ff0bd', 15);
    state.chef.swing = 1;
    state.shake = Math.max(state.shake, 2);
    audio.chop();
    audio.bell();
  } else {
    addPopup(state, 'MISSED — try again', 452, 284, '#ff9b86', 14);
    state.shake = Math.max(state.shake, 4);
    audio.error();
  }
}

function toggleStir(state) {
  const bowl = state.bowl;
  if (bowl.burnt) {
    setToast(state, 'It is burnt — bin it and start again', '#ff9b86');
    audio.error();
    return;
  }
  if (bowl.cooked) {
    setToast(state, 'Already cooked — plate it at the pass', '#8fe0b0');
    return;
  }
  if (bowl.ingredients.length === 0) {
    setToast(state, 'Fill your bowl first', '#ffb347');
    audio.error();
    return;
  }
  if (!matchBowl(bowl)) {
    setToast(state, 'That is not a recipe — bin it', '#ffb347');
    audio.error();
    return;
  }
  if (!bowl.chopped) {
    setToast(state, 'Chop it at the board first', '#ffb347');
    audio.error();
    return;
  }
  state.mouseStir = !state.mouseStir;
  if (state.mouseStir) audio.sizzle();
}

function releaseWok(state) {
  const bowl = state.bowl;
  if (!bowl.stir) return;
  bowl.stir = false;
  const [lo, hi] = TIMINGS.heatGreen;
  if (bowl.heat >= lo && bowl.heat <= hi) {
    bowl.cooked = true;
    bowl.cookQuality = Math.max(0, 1 - Math.abs(bowl.heat - (lo + hi) / 2) / ((hi - lo) / 2));
    addParticles(state, 694, 320, 16, 'spark', {
      color: '#ffd27a', speed: 150, size: 3, life: 0.5, gravity: 0, spread: 2.8,
    });
    addPopup(state, bowl.cookQuality > 0.7 ? 'PERFECT WOK' : 'COOKED', 694, 252, '#ffd784', 15);
    audio.bell();
    state.shake = Math.max(state.shake, 3);
  } else if (bowl.heat < lo) {
    addPopup(state, 'too cool — stir longer', 694, 258, '#9fb8b2', 12);
  } else {
    addPopup(state, 'watch the flame!', 694, 258, '#ff9b86', 13);
    audio.error();
  }
}

function plateDish(state) {
  const bowl = state.bowl;
  if (state.plate) {
    setToast(state, 'A plate is already on the pass', '#ffb347');
    return;
  }
  if (!bowl.cooked || bowl.burnt) {
    setToast(state, 'Cook the dish in the wok first', '#ffb347');
    audio.error();
    return;
  }
  const recipe = matchBowl(bowl);
  if (!recipe) {
    setToast(state, 'That is not a recipe', '#ffb347');
    audio.error();
    return;
  }
  state.plate = {
    recipeId: recipe.id,
    quality: (bowl.chopQuality + bowl.cookQuality) / 2,
    garnish: recipe.garnish,
    age: 0,
    shine: 1,
  };
  state.bowl = {
    ...state.bowl,
    ingredients: [],
    chopped: false,
    chopQuality: 0,
    heat: 0,
    cooked: false,
    cookQuality: 0,
    burnt: false,
    chopping: false,
    stir: false,
  };
  state.mouseStir = false;
  addSteam(state, 1088, 350, 5);
  addParticles(state, 1088, 380, 8, 'spark', {
    color: '#fff3c9', speed: 70, size: 2.2, life: 0.4, gravity: 0,
  });
  addPopup(state, 'PLATED', 1088, 300, '#fff3c9', 16);
  audio.plate();
}

function servePlate(state) {
  const plate = state.plate;
  if (!plate) {
    setToast(state, 'Nothing to serve — plate a dish first', '#ffb347');
    return;
  }
  const recipe = recipeById(plate.recipeId);
  const ticket = state.tickets.find((item) => item && item.status === 'live' && item.recipeId === plate.recipeId);
  if (!ticket) {
    state.combo = 0;
    state.shift = Math.max(0, state.shift - TIMINGS.wrongServePenalty);
    state.plate = null;
    state.flash = 1;
    state.shake = 10;
    state.tickets.forEach((item) => { if (item) item.rejected = 1; });
    addPopup(state, 'WRONG DISH  −5s', 1092, 500, '#ff8f76', 22);
    addParticles(state, 1092, 540, 12, 'bit', {
      color: '#ff8f76', speed: 180, size: 3.4, life: 0.6, gravity: 420, spread: 2.2,
    });
    audio.error();
    return;
  }

  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served += 1;
  state.servedFlash = 1;
  state.shake = Math.max(state.shake, 6);
  const patienceBonus = Math.round(60 * (ticket.patience / ticket.maxPatience));
  const comboBonus = state.combo * 15;
  const qualityBonus = Math.round(plate.quality * 25);
  const total = recipe.payout + patienceBonus + comboBonus + qualityBonus;
  state.score += total;
  if (plate.quality > 0.72) state.perfect += 1;
  ticket.status = 'served';
  ticket.hold = TIMINGS.ticketHold;
  ticket.stamp = 0;
  state.plate = null;
  state.bowl = {
    ...state.bowl, ingredients: [], chopped: false, chopQuality: 0, heat: 0,
    cooked: false, cookQuality: 0, burnt: false, chopping: false, stir: false,
  };
  state.mouseStir = false;
  addPopup(state, `+ $${total}`, 1092, 494, '#ffd784', 26);
  addPopup(state, `TIP +$${patienceBonus}`, 1092, 528, '#9ff0bd', 13);
  addParticles(state, 1092, 520, 18, 'coin', {
    color: '#ffd784', speed: 210, size: 4, life: 0.9, gravity: 520, spread: 2.6,
  });
  addSteam(state, 1092, 380, 4);
  audio.serve();
  audio.coin();
}

function trashBowl(state) {
  const bowl = state.bowl;
  if (bowl.ingredients.length === 0 && !bowl.burnt && !bowl.cooked) {
    setToast(state, 'Nothing in the bowl', '#8fa6a3');
    return;
  }
  addParticles(state, 868, 512, 12, 'bit', {
    color: '#7d8f88', speed: 130, size: 3.2, life: 0.55, gravity: 480, spread: 2,
  });
  state.bowl = {
    ...state.bowl, ingredients: [], chopped: false, chopQuality: 0, heat: 0,
    cooked: false, cookQuality: 0, burnt: false, chopping: false, stir: false,
  };
  state.mouseStir = false;
  addPopup(state, 'TOSSED', 868, 500, '#9fb8b2', 14);
  audio.trash();
}

function perform(state, kind, index) {
  if (kind === 'crate') addIngredient(state, index);
  else if (kind === 'pass') plateDish(state);
  else if (kind === 'hatch') servePlate(state);
  else if (kind === 'trash') trashBowl(state);
  else if (kind === 'wok') toggleStir(state);
  else if (kind === 'board') startChop(state);
}

function hitAt(x, y) {
  const order = ['hatch', 'trash', 'pass', 'wok', 'board', 'crates'];
  for (const key of order) {
    if (key === 'crates') {
      for (const hit of HITS.crates) {
        if (x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h) return hit;
      }
    } else {
      const hit = HITS[key];
      if (x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h) return hit;
    }
  }
  return null;
}

export function handleClicks(state, clicks) {
  for (const click of clicks) {
    const hit = hitAt(click.x, click.y);
    if (!hit) continue;
    const point = hit.kind === 'crate' ? CRATE_CENTERS[hit.index] : STATIONS[hit.kind];
    const distance = chefDistance(state, point);
    const reach = hit.kind === 'crate' ? 160 : 150;
    if (distance <= reach) {
      perform(state, hit.kind, hit.index);
    } else {
      sendChefTo(state, hit.target.x, hit.target.y, { kind: hit.kind, index: hit.index });
    }
  }
}

function handlePending(state) {
  const pending = state.chef.pending;
  if (!pending) return;
  const point = pending.kind === 'crate'
    ? { x: CRATE_CENTERS[pending.index].x, y: CRATE.y + CRATE.h / 2 }
    : STATIONS[pending.kind];
  if (chefDistance(state, point) <= 128) {
    perform(state, pending.kind, pending.index);
    state.chef.pending = null;
  }
}

export function updateKitchen(state, dt, input) {
  const bowl = state.bowl;
  if (bowl.chopping) {
    bowl.chopNeedle += bowl.chopDir * dt / TIMINGS.chopSweep;
    if (bowl.chopNeedle >= 1) {
      bowl.chopNeedle = 1;
      bowl.chopDir = -1;
    } else if (bowl.chopNeedle <= 0) {
      bowl.chopNeedle = 0;
      bowl.chopDir = 1;
    }
  }

  if (input.pressed('Space') && chefNear(state, STATIONS.board, 26)) {
    if (bowl.chopping) resolveChop(state);
    else startChop(state);
  }

  const holding = input.down('KeyE') || state.mouseStir;
  const atWok = chefNear(state, STATIONS.wok, 18);
  if (holding && atWok && bowl.chopped && !bowl.cooked && !bowl.burnt) {
    bowl.stir = true;
    bowl.heat = Math.min(1, bowl.heat + TIMINGS.heatRise * dt);
    if (bowl.heat >= TIMINGS.heatBurn) {
      bowl.burnt = true;
      bowl.stir = false;
      state.mouseStir = false;
      state.shake = 9;
      state.flash = 0.8;
      addPopup(state, 'BURNT!  bin it', 694, 250, '#ff8f76', 20);
      addParticles(state, 694, 318, 16, 'bit', {
        color: '#332b27', speed: 160, size: 5, life: 0.9, gravity: 180, spread: 2.2,
      });
      audio.error();
    } else if (Math.random() < dt * 18) {
      addParticles(state, 694 + (Math.random() - 0.5) * 54, 320, 1, 'spark', {
        color: '#ffc36a', speed: 70, size: 2.4, life: 0.4, gravity: 20, spread: 1.4,
      });
      if (Math.random() < 0.35) audio.sizzle();
    }
  } else if (bowl.stir) {
    releaseWok(state);
  }
  if (!atWok && state.mouseStir) state.mouseStir = false;

  if (input.pressed('KeyE') && !atWok) {
    const near = nearestStation(state);
    if (near && near.kind !== 'board' && near.kind !== 'wok') {
      perform(state, near.kind, near.index);
    }
  }

  handlePending(state);

  state.steamClock += dt;
  if (state.steamClock > 0.22) {
    state.steamClock = 0;
    if (state.plate) addSteam(state, 1088, 352, 1);
    if (state.tickets.some(Boolean)) addSteam(state, 694, 286, 1);
  }

  if (bowl.heat > 0 && !bowl.stir) bowl.heat = Math.max(0, bowl.heat - TIMINGS.heatCool * dt);

  state.prompt = currentPrompt(state);
}
