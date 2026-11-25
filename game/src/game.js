// The shift itself: fixed-step updates, three ticket slots, new tickets arriving
// after a slot frees, patience running out and the end-of-shift whistle.

import { RECIPES, TIMINGS } from './config.js';
import {
  addParticles, addPopup, createState, fillTicketSlots, makeRandom, makeTicket,
  recipeById, resetRun, updateParticles,
} from './state.js';
import { updateChef } from './chef.js';
import { handleClicks, updateKitchen } from './kitchen.js';
import { audio } from './audio.js';

const TICKET_TOP = [130, 276, 422];

function spawnTicket(state, slot, random) {
  const busy = new Set(state.tickets.filter(Boolean).map((ticket) => ticket.recipeId));
  let pool = RECIPES.filter((recipe) => !busy.has(recipe.id));
  if (pool.length === 0) pool = RECIPES;
  const recipe = pool[Math.floor(random() * pool.length) % pool.length];
  const ticket = makeTicket(recipe, slot, random);
  ticket.id = state.nextTicket;
  state.nextTicket += 1;
  ticket.age = 0;
  state.tickets[slot] = ticket;
  addPopup(state, 'NEW TICKET', 165, TICKET_TOP[slot] + 20, '#ffd784', 10);
  audio.pop();
}

function updateTickets(state, dt, random) {
  for (let slot = 0; slot < state.tickets.length; slot += 1) {
    const ticket = state.tickets[slot];
    if (!ticket) {
      state.cooldowns[slot] = Math.max(0, state.cooldowns[slot] - dt);
      if (state.cooldowns[slot] <= 0 && state.shift > TIMINGS.newTicketWarning) {
        spawnTicket(state, slot, random);
      }
      continue;
    }
    ticket.age += dt;
    ticket.rejected = Math.max(0, ticket.rejected - dt * 2.4);
    if (ticket.status === 'live') {
      ticket.patience -= dt;
      if (ticket.patience <= 0) {
        ticket.patience = 0;
        ticket.status = 'lost';
        ticket.hold = 1.7;
        state.lost += 1;
        state.combo = 0;
        state.shake = Math.max(state.shake, 7);
        state.flash = Math.max(state.flash, 0.6);
        addPopup(state, 'TICKET LOST', 165, TICKET_TOP[slot] + 66, '#ff8f76', 18);
        addParticles(state, 165, TICKET_TOP[slot] + 70, 8, 'bit', {
          color: '#c7b287', speed: 100, size: 3, life: 0.6, gravity: 260, spread: 2.4,
        });
        audio.error();
      }
    } else {
      ticket.hold -= dt;
      ticket.stamp = Math.min(1, ticket.stamp + dt * 5);
      if (ticket.hold <= 0) {
        state.tickets[slot] = null;
        state.cooldowns[slot] = TIMINGS.ticketGap;
      }
    }
  }
}

export function createGame(seed = 7) {
  const random = makeRandom(seed);
  const state = createState(seed);

  function begin() {
    resetRun(state, random);
    state.shiftNumber = 1;
    state.screen = 'play';
    state.paused = false;
    audio.ensure();
  }

  function endShift() {
    state.screen = 'end';
    state.paused = false;
    state.shake = 8;
    audio.bell();
  }

  function update(dt, input) {
    if (state.screen !== 'play' || state.paused) return;
    state.time += dt;
    state.shift = Math.max(0, state.shift - dt);

    handleClicks(state, input.takeClicks());
    updateChef(state, dt, input);
    updateKitchen(state, dt, input);
    updateTickets(state, dt, random);
    updateParticles(state, dt);

    if (state.shift <= 0) endShift();
    input.endFrame();
  }

  return { state, begin, update };
}
