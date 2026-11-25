// The paper side of the stall: order board, shift clock, score, prompts, the title
// card with tonight's menu, pause and the end-of-shift report.

import {
  FONT, INGREDIENTS, LAYOUT, MONO, PALETTE, RANKS, RECIPES, TIMINGS,
} from './config.js';
import { drawDish, drawIngredient, fillRound, label, roundRect } from './render.js';
import { recipeById } from './state.js';

const BOARD = LAYOUT.board;
const TICKET_X = 24;
const TICKET_W = 282;
const TICKET_Y = [130, 276, 422];
const TICKET_H = 138;

function formatClock(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function keycap(ctx, x, y, text, width = 22) {
  fillRound(ctx, x, y - 12, width, 20, 4, '#173534');
  ctx.strokeStyle = 'rgba(255,196,110,0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y - 12, width, 20, 4);
  ctx.stroke();
  label(ctx, text, x + width / 2, y + 2, 9, '#ffd784', { align: 'center', weight: 900, mono: true });
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = 'rgba(4,16,17,0.88)';
  ctx.fillRect(0, 0, 1280, 78);
  const rule = ctx.createLinearGradient(0, 0, 1280, 0);
  rule.addColorStop(0, 'rgba(255,179,71,0.1)');
  rule.addColorStop(0.5, 'rgba(255,179,71,0.75)');
  rule.addColorStop(1, 'rgba(255,179,71,0.1)');
  ctx.fillStyle = rule;
  ctx.fillRect(0, 76, 1280, 2);

  ctx.beginPath();
  ctx.arc(33, 31, 12, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.red;
  ctx.fill();
  ctx.strokeStyle = '#ffd784';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  label(ctx, 'W', 33, 36, 13, '#fff3d4', { align: 'center', weight: 900 });
  label(ctx, 'WOK LUCK', 54, 37, 20, PALETTE.cream, { weight: 900, spacing: 1 });
  label(ctx, `NIGHT MARKET  ·  SHIFT ${state.shiftNumber ?? 1}`, 55, 54, 8, PALETTE.muted, { spacing: 1.4 });

  fillRound(ctx, 548, 7, 184, 64, 9, 'rgba(11,37,38,0.9)');
  ctx.strokeStyle = 'rgba(255,179,71,0.42)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, 548, 7, 184, 64, 9);
  ctx.stroke();
  label(ctx, 'SHIFT CLOCK', 640, 20, 7.5, PALETTE.muted, { align: 'center', spacing: 2.5 });
  const low = state.shift <= 15;
  const clockColor = low ? '#ff8f76' : PALETTE.amberHot;
  label(ctx, formatClock(state.shift), 640, 49, 32, clockColor, {
    align: 'center', weight: 900, mono: true,
    shadow: low ? 'rgba(255,80,50,0.55)' : 'rgba(255,170,60,0.28)', shadowBlur: 12,
  });
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(578, 59, 124, 4);
  ctx.fillStyle = low ? PALETTE.red : PALETTE.amber;
  ctx.fillRect(578, 59, 124 * Math.max(0, state.shift / 90), 4);

  label(ctx, 'SCORE', 1112, 21, 8, PALETTE.muted, { align: 'right', spacing: 2 });
  label(ctx, state.score.toLocaleString('en-US'), 1112, 53, 27, PALETTE.cream, { align: 'right', weight: 900 });
  const combo = state.combo;
  fillRound(ctx, 1132, 16, 122, 44, 8, combo > 0 ? 'rgba(226,84,60,0.92)' : 'rgba(20,48,47,0.9)');
  ctx.strokeStyle = combo > 0 ? '#ffd784' : 'rgba(140,180,170,0.3)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, 1132, 16, 122, 44, 8);
  ctx.stroke();
  if (combo > 0) {
    label(ctx, `x${combo}`, 1150, 48, 24, '#fff3d4', { weight: 900 });
    label(ctx, 'COMBO', 1214, 34, 7, '#ffe4a8', { align: 'center', spacing: 1.5 });
    label(ctx, `+$${combo * 15} TIP`, 1214, 48, 7, '#ffd0b8', { align: 'center' });
  } else {
    label(ctx, 'NO COMBO', 1193, 35, 9, PALETTE.muted, { align: 'center', spacing: 1.5 });
    label(ctx, 'SERVE TO START', 1193, 49, 7, 'rgba(143,166,163,0.65)', { align: 'center' });
  }
}

function drawTicket(ctx, state, ticket, slot) {
  const x = TICKET_X + (ticket.rejected > 0 ? Math.sin(state.time * 48) * 4 * ticket.rejected : 0);
  const y = TICKET_Y[slot];
  const w = TICKET_W;
  const h = TICKET_H;
  const recipe = recipeById(ticket.recipeId);
  const slide = ticket.age < 0 ? -54 : -54 * Math.max(0, 1 - ticket.age / 0.28);
  ctx.save();
  ctx.translate(x + slide, y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 4, w / 2 - 4, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  const paper = ctx.createLinearGradient(0, 0, 0, h);
  paper.addColorStop(0, '#f7edd5');
  paper.addColorStop(1, '#eadcba');
  fillRound(ctx, 0, 0, w, h, 7, paper);
  ctx.strokeStyle = '#c7b287';
  ctx.lineWidth = 1.2;
  roundRect(ctx, 0, 0, w, h, 7);
  ctx.stroke();
  ctx.fillStyle = recipe.accent;
  ctx.fillRect(0, 0, 5, h);
  ctx.fillStyle = 'rgba(120,96,62,0.2)';
  for (let i = 0; i < 4; i += 1) ctx.fillRect(14, 108 + i * 3, w - 28, 1);

  const live = ticket.status === 'live';
  const matching = live && state.plate && state.plate.recipeId === ticket.recipeId;
  const highlight = matching || ticket.highlight;
  if (highlight) {
    ctx.strokeStyle = 'rgba(255,179,71,0.95)';
    ctx.lineWidth = 2.6;
    roundRect(ctx, -2, -2, w + 4, h + 4, 9);
    ctx.stroke();
    fillRound(ctx, w - 58, 8, 50, 15, 4, '#e2543c');
    label(ctx, matching ? 'READY' : 'NEXT UP', w - 33, 19, 7, '#fff3d4', { align: 'center', weight: 900, spacing: 1 });
  }

  label(ctx, `#${String(ticket.id).padStart(2, '0')}`, 15, 17, 8, '#8a7352', { mono: true, weight: 700 });
  label(ctx, 'NIGHT MARKET', 88, 17, 6.5, '#a08a64', { spacing: 1.2 });
  drawDish(ctx, recipe, 27, 42, 0.46, false, state.time);
  label(ctx, recipe.name, 50, 41, 13, '#2a2018', { weight: 900 });
  label(ctx, `$${ticket.payout}`, w - 13, 41, 13, '#a34a24', { align: 'right', weight: 900 });

  recipe.ingredients.forEach((id, i) => {
    const chipX = 12 + i * 82;
    const chipY = 53;
    fillRound(ctx, chipX, chipY, 78, 21, 4, 'rgba(196,171,126,0.28)');
    ctx.strokeStyle = 'rgba(150,124,84,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, chipX, chipY, 78, 21, 4);
    ctx.stroke();
    drawIngredient(ctx, id, chipX + 11, chipY + 10.5, 13);
    label(ctx, INGREDIENTS.find((item) => item.id === id).label, chipX + 21, chipY + 14, 7.2, '#5a4730', { weight: 900, spacing: 0.4 });
  });

  const ratio = Math.max(0, Math.min(1, ticket.patience / ticket.maxPatience));
  const barColor = ratio > 0.55 ? '#4fae78' : ratio > 0.28 ? '#d99a32' : '#d34a35';
  label(ctx, 'PATIENCE', 12, 87, 6.5, '#8a7352', { spacing: 1.2 });
  label(ctx, `${Math.ceil(Math.max(0, ticket.patience))}s`, w - 13, 87, 7.5, ratio < 0.28 ? '#b33a26' : '#7a6545', { align: 'right', weight: 800, mono: true });
  fillRound(ctx, 12, 92, w - 24, 9, 4, 'rgba(90,72,48,0.22)');
  fillRound(ctx, 12, 92, (w - 24) * ratio, 9, 4, barColor);
  if (ratio < 0.28 && live) {
    ctx.globalAlpha = 0.35 + Math.sin(state.time * 9) * 0.3;
    fillRound(ctx, 12, 92, (w - 24) * ratio, 9, 4, '#ff7b5c');
    ctx.globalAlpha = 1;
  }
  label(ctx, `BASE $${ticket.payout}`, 12, 120, 6.8, '#8a7352', { spacing: 0.8 });
  label(ctx, 'TIP + PATIENCE', w - 13, 120, 6.8, '#8a7352', { align: 'right', spacing: 0.8 });
  ctx.fillStyle = 'rgba(120,96,62,0.25)';
  ctx.fillRect(12, 125, w - 24, 1);

  if (ticket.status === 'served') {
    ctx.save();
    ctx.translate(w / 2, h / 2 - 4);
    ctx.rotate(-0.13);
    const alpha = 0.7 + Math.sin(state.time * 8) * 0.15;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#b33a26';
    ctx.lineWidth = 3;
    roundRect(ctx, -60, -17, 120, 34, 5);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(179,58,38,0.5)';
    ctx.lineWidth = 1;
    roundRect(ctx, -56, -13, 112, 26, 3);
    ctx.stroke();
    label(ctx, 'SERVED', 0, 8, 20, '#b33a26', { align: 'center', weight: 900, spacing: 2 });
    ctx.restore();
  } else if (ticket.status === 'lost') {
    ctx.save();
    ctx.translate(w / 2, h / 2 - 4);
    ctx.rotate(0.06);
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = '#5f6b66';
    ctx.lineWidth = 3;
    roundRect(ctx, -48, -16, 96, 32, 4);
    ctx.stroke();
    label(ctx, 'LOST', 0, 8, 19, '#5f6b66', { align: 'center', weight: 900, spacing: 3 });
    ctx.restore();
  }
  ctx.restore();
}

function drawOrderBoard(ctx, state) {
  const x = BOARD.x;
  const y = BOARD.y;
  const w = BOARD.w;
  const h = BOARD.h;
  const panel = ctx.createLinearGradient(x, y, x, y + h);
  panel.addColorStop(0, '#0c2527');
  panel.addColorStop(1, '#081b1d');
  fillRound(ctx, x, y, w, h, 12, panel);
  ctx.strokeStyle = 'rgba(110,170,155,0.22)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,179,71,0.5)';
  ctx.fillRect(x + 18, y + 1, w - 36, 2);

  ctx.beginPath();
  ctx.arc(x + 30, y + 27, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#b33a26';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,215,132,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  label(ctx, '旺', x + 30, y + 32, 12, '#ffe4a8', { align: 'center', weight: 900 });
  label(ctx, 'ORDER BOARD', x + 49, y + 31, 13, PALETTE.cream, { weight: 900, spacing: 1.2 });
  const live = state.tickets.filter((ticket) => ticket && ticket.status === 'live').length;
  label(ctx, `${live} LIVE`, x + w - 16, y + 28, 8, live ? PALETTE.jade : PALETTE.muted, { align: 'right', spacing: 1.4 });
  label(ctx, 'TICKETS · NIGHT MARKET', x + 49, y + 42, 6.5, PALETTE.muted, { spacing: 1.2 });

  for (let slot = 0; slot < 3; slot += 1) {
    const ticket = state.tickets[slot];
    if (ticket) drawTicket(ctx, state, ticket, slot);
    else {
      const emptyY = TICKET_Y[slot];
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(120,165,155,0.18)';
      ctx.lineWidth = 1.2;
      roundRect(ctx, TICKET_X, emptyY, TICKET_W, TICKET_H, 7);
      ctx.stroke();
      ctx.setLineDash([]);
      label(ctx, 'WAITING FOR A TICKET', TICKET_X + TICKET_W / 2, emptyY + TICKET_H / 2 + 3, 8, 'rgba(143,166,163,0.4)', { align: 'center', spacing: 1.2 });
      ctx.restore();
    }
  }

  label(ctx, 'RECIPE CARD', x + 13, y + 494, 7.5, PALETTE.amber, { spacing: 2 });
  label(ctx, '3 ingredients = 1 dish', x + w - 13, y + 494, 6.5, PALETTE.muted, { align: 'right' });
  RECIPES.forEach((recipe, i) => {
    const cellX = x + 13 + (i % 2) * 140;
    const cellY = y + 508 + Math.floor(i / 2) * 25;
    recipe.ingredients.forEach((id, j) => {
      const item = INGREDIENTS.find((entry) => entry.id === id);
      ctx.beginPath();
      ctx.arc(cellX + 4 + j * 9, cellY - 2, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
    });
    label(ctx, recipe.short, cellX + 31, cellY + 1, 8, '#e8ddc2', { weight: 800 });
    label(ctx, `$${recipe.payout}`, cellX + 126, cellY + 1, 7.5, '#d8a85c', { align: 'right', weight: 800 });
  });
  label(ctx, 'READ THE TICKET  ·  PLAN THE ROUTE', x + w / 2, y + h - 9, 6.5, 'rgba(143,166,163,0.55)', { align: 'center', spacing: 1.1 });
}

function drawBottomBar(ctx, state) {
  ctx.fillStyle = 'rgba(4,16,17,0.94)';
  ctx.fillRect(0, 646, 1280, 74);
  const rule = ctx.createLinearGradient(0, 0, 1280, 0);
  rule.addColorStop(0, 'rgba(255,179,71,0.08)');
  rule.addColorStop(0.5, 'rgba(255,179,71,0.5)');
  rule.addColorStop(1, 'rgba(255,179,71,0.08)');
  ctx.fillStyle = rule;
  ctx.fillRect(0, 646, 1280, 1.5);

  const prompt = state.prompt ?? { text: 'WASD — walk the kitchen', tone: 'idle' };
  const tone = prompt.tone === 'hot' ? '#ffb08a' : prompt.tone === 'warn' ? '#ff9b86' : prompt.tone === 'go' ? '#ffd784' : '#b9ccc6';
  ctx.save();
  ctx.font = `800 15px ${FONT}`;
  const textWidth = Math.min(560, ctx.measureText(prompt.text).width + 58);
  ctx.restore();
  fillRound(ctx, 640 - textWidth / 2, 657, textWidth, 40, 8, 'rgba(14,42,42,0.92)');
  ctx.strokeStyle = prompt.tone === 'hot' ? 'rgba(255,120,80,0.7)' : 'rgba(255,179,71,0.45)';
  ctx.lineWidth = 1.3;
  roundRect(ctx, 640 - textWidth / 2, 657, textWidth, 40, 8);
  ctx.stroke();
  label(ctx, prompt.text, 640, 683, 15, tone, { align: 'center', weight: 800 });

  label(ctx, 'WASD / ARROWS — WALK', 22, 672, 8, PALETTE.muted, { spacing: 1 });
  label(ctx, 'CLICK ANY STATION — WALK & USE', 22, 690, 7, 'rgba(143,166,163,0.6)', { spacing: 0.8 });
  label(ctx, 'M — MUTE    P — PAUSE', 1258, 672, 8, PALETTE.muted, { align: 'right', spacing: 1 });
  label(ctx, `SEED ${state.seed}`, 1258, 690, 7, 'rgba(143,166,163,0.55)', { align: 'right', spacing: 1 });

  if (state.toast) {
    const alpha = Math.min(1, state.toast.life / 0.35);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `800 12px ${FONT}`;
    const width = ctx.measureText(state.toast.text).width + 32;
    fillRound(ctx, 640 - width / 2, 614, width, 26, 6, 'rgba(7,24,25,0.94)');
    ctx.strokeStyle = state.toast.color;
    ctx.lineWidth = 1;
    roundRect(ctx, 640 - width / 2, 614, width, 26, 6);
    ctx.stroke();
    label(ctx, state.toast.text, 640, 632, 12, state.toast.color, { align: 'center', weight: 800 });
    ctx.restore();
  }
}

function drawMenuRow(ctx, recipe, x, y, width) {
  drawDish(ctx, recipe, x + 16, y - 6, 0.6, false, 0);
  label(ctx, recipe.name, x + 40, y, 13, PALETTE.cream, { weight: 800 });
  recipe.ingredients.forEach((id, i) => {
    const item = INGREDIENTS.find((entry) => entry.id === id);
    const tx = x + 46 + i * 46;
    ctx.beginPath();
    ctx.arc(tx, y + 15, 3, 0, Math.PI * 2);
    ctx.fillStyle = item.color;
    ctx.fill();
    label(ctx, item.short, tx + 6, y + 18, 6.5, 'rgba(232,221,194,0.78)', { weight: 800, spacing: 0.6 });
  });
  label(ctx, `$${recipe.payout}`, x + width, y, 13, PALETTE.amber, { align: 'right', weight: 900 });
  ctx.strokeStyle = 'rgba(190,170,130,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 27);
  ctx.lineTo(x + width, y + 27);
  ctx.stroke();
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(4,15,16,0.7)';
  ctx.fillRect(0, 0, 1280, 720);
  const glow = ctx.createRadialGradient(640, 260, 40, 640, 300, 520);
  glow.addColorStop(0, 'rgba(255,150,60,0.2)');
  glow.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 60, 1280, 600);

  label(ctx, 'MAKE.FUN NIGHT MARKET PRESENTS', 640, 110, 10, PALETTE.amber, { align: 'center', spacing: 4, weight: 800 });
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `900 108px ${FONT}`;
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#7a2a1c';
  ctx.strokeText('WOK LUCK', 640, 236);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffcf7a';
  ctx.strokeText('WOK LUCK', 640, 236);
  const logo = ctx.createLinearGradient(0, 150, 0, 236);
  logo.addColorStop(0, '#fff8e2');
  logo.addColorStop(0.55, '#ffe4a8');
  logo.addColorStop(1, '#ffb347');
  ctx.fillStyle = logo;
  ctx.fillText('WOK LUCK', 640, 236);
  ctx.restore();

  ctx.fillStyle = PALETTE.red;
  ctx.beginPath();
  ctx.ellipse(640, 258, 156, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  label(ctx, 'A 90-SECOND NIGHT-MARKET SERVICE RUSH', 640, 288, 13, '#ffd8a0', { align: 'center', spacing: 3, weight: 800 });
  label(ctx, 'Five crates. Four recipes. One very hot wok.', 640, 311, 11, PALETTE.muted, { align: 'center' });

  fillRound(ctx, 132, 338, 444, 266, 10, 'rgba(9,29,30,0.94)');
  ctx.strokeStyle = 'rgba(255,179,71,0.35)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, 132, 338, 444, 266, 10);
  ctx.stroke();
  label(ctx, "TONIGHT'S MENU", 152, 365, 10, PALETTE.amber, { spacing: 2.4, weight: 900 });
  label(ctx, '3 INGREDIENTS EACH', 556, 365, 7, PALETTE.muted, { align: 'right', spacing: 1.4 });
  RECIPES.forEach((recipe, i) => drawMenuRow(ctx, recipe, 152, 400 + i * 49, 404));

  fillRound(ctx, 708, 338, 440, 266, 10, 'rgba(9,29,30,0.94)');
  ctx.strokeStyle = 'rgba(110,170,155,0.3)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, 708, 338, 440, 266, 10);
  ctx.stroke();
  label(ctx, 'RUN THE STALL', 728, 365, 10, PALETTE.amber, { spacing: 2.4, weight: 900 });
  const rows = [
    ['WASD', 'walk the kitchen'],
    ['E', 'add · plate · serve'],
    ['HOLD E', 'stir the wok'],
    ['SPACE', 'chop · stop the meter'],
    ['CLICK', 'use any station'],
    ['P / M', 'pause · mute'],
  ];
  rows.forEach(([key, text], i) => {
    const y = 398 + i * 30;
    const width = key === 'WASD' ? 46 : key === 'HOLD E' ? 54 : key === 'SPACE' ? 50 : key === 'CLICK' ? 46 : 40;
    keycap(ctx, 728, y, key, width);
    label(ctx, text, 728 + width + 12, y + 2, 11, '#d8e4de', { weight: 700 });
  });
  label(ctx, 'A perfect chop and a clean wok pay a bigger tip.', 728, 584, 9, 'rgba(143,166,163,0.8)');

  const pulse = 0.72 + Math.sin(state.time * 4) * 0.28;
  ctx.save();
  ctx.globalAlpha = pulse;
  label(ctx, 'PRESS ENTER TO OPEN THE STALL', 640, 654, 20, '#ffd784', { align: 'center', weight: 900, spacing: 2.4 });
  ctx.restore();
  label(ctx, `SEED ${state.seed}  ·  SHIFT 1  ·  90 SECONDS`, 640, 682, 8, PALETTE.muted, { align: 'center', spacing: 2 });
}

function drawEnd(ctx, state) {
  ctx.fillStyle = 'rgba(3,12,13,0.8)';
  ctx.fillRect(0, 0, 1280, 720);
  const rank = RANKS.find((entry) => state.score >= entry.min) ?? RANKS[RANKS.length - 1];
  fillRound(ctx, 286, 112, 708, 500, 14, 'rgba(9,29,30,0.97)');
  ctx.strokeStyle = 'rgba(255,179,71,0.5)';
  ctx.lineWidth = 2;
  roundRect(ctx, 286, 112, 708, 500, 14);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,179,71,0.6)';
  ctx.fillRect(330, 113, 620, 2);
  label(ctx, 'SHIFT OVER', 640, 156, 12, PALETTE.amber, { align: 'center', spacing: 4, weight: 900 });
  label(ctx, rank.title, 640, 212, 44, PALETTE.cream, { align: 'center', weight: 900, spacing: 1 });
  label(ctx, rank.blurb, 640, 240, 12, PALETTE.muted, { align: 'center' });
  label(ctx, state.score.toLocaleString('en-US'), 640, 316, 62, PALETTE.amberHot, { align: 'center', weight: 900, mono: true });
  label(ctx, 'TOTAL SCORE', 640, 336, 8, PALETTE.muted, { align: 'center', spacing: 2.4 });

  const stats = [
    ['SERVED', state.served],
    ['LOST', state.lost],
    ['BEST COMBO', `x${state.bestCombo}`],
    ['PERFECT', state.perfect],
  ];
  stats.forEach(([name, value], i) => {
    const x = 390 + i * 168;
    fillRound(ctx, x - 62, 364, 124, 70, 8, 'rgba(19,52,51,0.8)');
    ctx.strokeStyle = 'rgba(130,190,175,0.18)';
    ctx.lineWidth = 1;
    roundRect(ctx, x - 62, 364, 124, 70, 8);
    ctx.stroke();
    label(ctx, String(value), x, 404, 24, PALETTE.cream, { align: 'center', weight: 900 });
    label(ctx, name, x, 422, 7, PALETTE.muted, { align: 'center', spacing: 1.4 });
  });

  label(ctx, state.score >= state.best ? 'A NEW HOUSE BEST' : `HOUSE BEST  $${state.best.toLocaleString('en-US')}`, 640, 472, 10, state.score >= state.best ? PALETTE.jade : PALETTE.muted, { align: 'center', spacing: 1.6, weight: 800 });
  const pulse = 0.7 + Math.sin(state.time * 4) * 0.3;
  ctx.save();
  ctx.globalAlpha = pulse;
  fillRound(ctx, 440, 508, 400, 48, 8, 'rgba(226,84,60,0.9)');
  ctx.strokeStyle = '#ffd784';
  ctx.lineWidth = 1.4;
  roundRect(ctx, 440, 508, 400, 48, 8);
  ctx.stroke();
  label(ctx, 'ENTER — OPEN AGAIN', 640, 539, 16, '#fff3d4', { align: 'center', weight: 900, spacing: 2 });
  ctx.restore();
  label(ctx, 'WOK LUCK  ·  NIGHT MARKET SERIES', 640, 588, 8, 'rgba(143,166,163,0.55)', { align: 'center', spacing: 2 });
}

function drawPause(ctx, state) {
  ctx.fillStyle = 'rgba(3,12,13,0.62)';
  ctx.fillRect(0, 0, 1280, 720);
  fillRound(ctx, 470, 282, 340, 150, 12, 'rgba(9,29,30,0.97)');
  ctx.strokeStyle = 'rgba(255,179,71,0.5)';
  ctx.lineWidth = 2;
  roundRect(ctx, 470, 282, 340, 150, 12);
  ctx.stroke();
  label(ctx, 'PAUSED', 640, 346, 40, PALETTE.cream, { align: 'center', weight: 900, spacing: 3 });
  label(ctx, 'P — BACK TO THE WOK', 640, 388, 12, PALETTE.amber, { align: 'center', spacing: 1.8, weight: 800 });
  label(ctx, `SCORE  ${state.score.toLocaleString('en-US')}`, 640, 414, 9, PALETTE.muted, { align: 'center', spacing: 1.4 });
}

export function drawHud(ctx, state) {
  if (state.screen === 'title') {
    drawTitle(ctx, state);
    return;
  }
  drawTopBar(ctx, state);
  drawOrderBoard(ctx, state);
  drawBottomBar(ctx, state);
  if (state.screen === 'end') drawEnd(ctx, state);
  else if (state.paused) drawPause(ctx, state);
}
