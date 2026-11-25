// Chef movement, click-to-walk targets and the little squash/stretch, cleaver swing
// and stirring animations the kitchen reads at a glance.

import { CHEF, MOVEMENT } from './config.js';
import { clampChef } from './state.js';

const ARRIVE = 12;

export function updateChef(state, dt, input) {
  const chef = state.chef;
  let dx = input.axisX();
  let dy = input.axisY();

  if (dx !== 0 || dy !== 0) {
    chef.target = null;
    chef.pending = null;
  } else if (chef.target) {
    const tx = chef.target.x - chef.x;
    const ty = chef.target.y - chef.y;
    const distance = Math.hypot(tx, ty);
    if (distance <= ARRIVE) {
      chef.target = null;
    } else {
      dx = tx / distance;
      dy = ty / distance;
    }
  }

  const length = Math.hypot(dx, dy);
  if (length > 0) {
    dx /= length;
    dy /= length;
    chef.vx = dx * MOVEMENT.speed;
    chef.vy = dy * MOVEMENT.speed;
    chef.walk += dt * 10;
    chef.squash += (0.9 - chef.squash) * Math.min(1, dt * 10);
    if (Math.abs(dx) > 0.1) chef.face = dx > 0 ? 1 : -1;
  } else {
    chef.vx *= 0.7;
    chef.vy *= 0.7;
    chef.walk += dt * 1.4;
    chef.squash += (1 - chef.squash) * Math.min(1, dt * 8);
  }

  chef.x += chef.vx * dt;
  chef.y += chef.vy * dt;
  clampChef(state);

  chef.swing = Math.max(0, chef.swing - dt * 5.4);
  if (state.bowl.chopping) chef.swing = Math.max(chef.swing, 0.5 + Math.sin(state.time * 26) * 0.4);
  if (state.bowl.stir) chef.stirT += dt * 12;
  else chef.stirT += dt * 1.5;

  if (state.particles.length > 160) state.particles.splice(0, state.particles.length - 160);
}

export function sendChefTo(state, x, y, pending) {
  state.chef.target = { x, y };
  state.chef.pending = pending ?? null;
}

export function chefNear(state, point, extra = 0) {
  return Math.hypot(state.chef.x - point.x, state.chef.y - point.y) <= CHEF.reach + extra;
}
