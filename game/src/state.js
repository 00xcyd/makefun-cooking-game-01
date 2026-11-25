// The mutable night-market world: shift clock, ticket slots, the chef's bowl,
// score and combo, and the small particle/popup pools every screen shares.

import {
  INGREDIENTS, RECIPES, STATIONS, SHIFT_SECONDS, TIMINGS, MOVEMENT,
} from './config.js';

/** Small deterministic PRNG so a seed replays the same shift. */
export function makeRandom(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) ?? RECIPES[0];
}

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id) ?? INGREDIENTS[0];
}

export function createBowl() {
  return {
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
}

export function createChef() {
  return {
    x: STATIONS.chefStart.x,
    y: STATIONS.chefStart.y,
    vx: 0,
    vy: 0,
    face: 1,
    walk: 0,
    squash: 1,
    swing: 0,
    stirT: 0,
    target: null,
    pending: null,
  };
}

export function createState(seed = 7) {
  return {
    seed,
    time: 0,
    shift: SHIFT_SECONDS,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    lost: 0,
    perfect: 0,
    screen: 'title',
    paused: false,
    muted: false,
    best: 0,
    tickets: [null, null, null],
    cooldowns: [0, 0, 0],
    nextTicket: 1,
    bowl: createBowl(),
    plate: null,
    chef: createChef(),
    prompt: { text: 'WASD — walk the kitchen', tone: 'idle' },
    particles: [],
    popups: [],
    steamClock: 0,
    shake: 0,
    toast: null,
    flash: 0,
    servedFlash: 0,
    shiftNumber: 1,
    mouseStir: false,
    time_of_day: 'night',
  };
}

export function makeTicket(recipe, slot, random, patienceScale = 1) {
  const spread = TIMINGS.patienceMax - TIMINGS.patienceMin;
  const patience = (TIMINGS.patienceMin + random() * spread) * patienceScale;
  return {
    id: 0,
    recipeId: recipe.id,
    slot,
    patience,
    maxPatience: patience,
    payout: recipe.payout,
    status: 'live',
    hold: 0,
    age: 0,
    stamp: 0,
    rejected: 0,
  };
}

export function fillTicketSlots(state, random) {
  const used = new Set(state.tickets.filter(Boolean).map((ticket) => ticket.recipeId));
  for (let slot = 0; slot < state.tickets.length; slot += 1) {
    if (state.tickets[slot]) continue;
    let pool = RECIPES.filter((recipe) => !used.has(recipe.id));
    if (pool.length === 0) pool = RECIPES;
    const recipe = pool[Math.floor(random() * pool.length) % pool.length];
    used.add(recipe.id);
    const ticket = makeTicket(recipe, slot, random);
    ticket.id = state.nextTicket;
    state.nextTicket += 1;
    ticket.age = -slot * 0.16;
    state.tickets[slot] = ticket;
  }
}

export function resetRun(state, random) {
  state.time = 0;
  state.shift = SHIFT_SECONDS;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.served = 0;
  state.lost = 0;
  state.perfect = 0;
  state.tickets = [null, null, null];
  state.cooldowns = [0, 0, 0];
  state.bowl = createBowl();
  state.plate = null;
  state.chef = createChef();
  state.particles.length = 0;
  state.popups.length = 0;
  state.shake = 0;
  state.toast = null;
  state.flash = 0;
  state.servedFlash = 0;
  state.mouseStir = false;
  state.prompt = { text: 'WASD — walk the kitchen', tone: 'idle' };
  fillTicketSlots(state, random);
}

export function matchBowl(bowl) {
  if (bowl.ingredients.length !== 3) return null;
  const key = [...bowl.ingredients].sort().join('+');
  return RECIPES.find((recipe) => [...recipe.ingredients].sort().join('+') === key) ?? null;
}

export function addPopup(state, text, x, y, color = '#ffd784', size = 20) {
  state.popups.push({ text, x, y, color, size, life: 1.35, max: 1.35, vy: -46 });
}

export function addParticles(state, x, y, count, kind, options = {}) {
  const random = options.random ?? Math.random;
  for (let i = 0; i < count; i += 1) {
    const angle = options.angle ?? -Math.PI / 2;
    const spread = options.spread ?? Math.PI * 1.4;
    const speed = (options.speed ?? 110) * (0.35 + random() * 0.85);
    const life = (options.life ?? 0.7) * (0.6 + random() * 0.8);
    state.particles.push({
      x: x + (random() - 0.5) * (options.jitterX ?? 24),
      y: y + (random() - 0.5) * (options.jitterY ?? 12),
      vx: Math.cos(angle + (random() - 0.5) * spread) * speed,
      vy: Math.sin(angle + (random() - 0.5) * spread) * speed,
      life,
      max: life,
      size: (options.size ?? 4) * (0.6 + random() * 0.9),
      color: options.color ?? '#ffb347',
      kind,
      gravity: options.gravity ?? 260,
      spin: (random() - 0.5) * 8,
      rot: random() * Math.PI * 2,
    });
  }
}

export function updateParticles(state, dt) {
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const particle = state.particles[i];
    particle.life -= dt;
    if (particle.life <= 0) {
      state.particles.splice(i, 1);
      continue;
    }
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += particle.gravity * dt;
    particle.rot += particle.spin * dt;
    if (particle.kind === 'steam') {
      particle.vx += Math.sin(state.time * 2.2 + particle.y * 0.02) * 9 * dt;
      particle.vy *= 0.995;
    }
  }
  for (let i = state.popups.length - 1; i >= 0; i -= 1) {
    const popup = state.popups[i];
    popup.life -= dt;
    popup.y += popup.vy * dt;
    popup.vy *= 0.96;
    if (popup.life <= 0) state.popups.splice(i, 1);
  }
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 3.2);
  state.servedFlash = Math.max(0, state.servedFlash - dt * 2.4);
  if (state.toast) {
    state.toast.life -= dt;
    if (state.toast.life <= 0) state.toast = null;
  }
}

export function addSteam(state, x, y, count = 1, random = Math.random) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x: x + (random() - 0.5) * 26,
      y: y + (random() - 0.5) * 8,
      vx: (random() - 0.5) * 16,
      vy: -24 - random() * 26,
      life: 1.1 + random() * 0.9,
      max: 2,
      size: 6 + random() * 8,
      color: '#dff3ea',
      kind: 'steam',
      gravity: -4,
      spin: 0,
      rot: 0,
    });
  }
}

export function setToast(state, text, color = '#ffd784') {
  state.toast = { text, color, life: 2.1 };
}

export function chefDistance(state, point) {
  return Math.hypot(state.chef.x - point.x, state.chef.y - point.y);
}

export function clampChef(state) {
  const chef = state.chef;
  chef.x = Math.max(MOVEMENT.minX, Math.min(MOVEMENT.maxX, chef.x));
  chef.y = Math.max(MOVEMENT.minY, Math.min(MOVEMENT.maxY, chef.y));
}
