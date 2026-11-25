// Every kitchen, chef, ingredient, flame and steam pixel is drawn here with canvas
// paths. No images, no fonts to load: the stall is code all the way down.

import {
  CRATE, CRATE_CENTERS, FONT, INGREDIENTS, LAYOUT, PALETTE, RECIPES,
  STATIONS, TIMINGS,
} from './config.js';
import { ingredientById, recipeById } from './state.js';

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function fillRound(ctx, x, y, w, h, r, fill) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function label(ctx, text, x, y, size, color, options = {}) {
  ctx.save();
  ctx.font = `${options.weight ?? 700} ${size}px ${options.mono ? '"SF Mono", Menlo, monospace' : FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = options.align ?? 'left';
  ctx.textBaseline = options.baseline ?? 'alphabetic';
  if (options.alpha !== undefined) ctx.globalAlpha = options.alpha;
  if (options.spacing) ctx.letterSpacing = `${options.spacing}px`;
  if (options.shadow) {
    ctx.shadowColor = options.shadow;
    ctx.shadowBlur = options.shadowBlur ?? 10;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawIngredient(ctx, id, x, y, size = 22) {
  const item = ingredientById(id);
  const s = size / 22;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (item.glyph === 'noodle') {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2.2;
    for (let row = -1; row <= 1; row += 1) {
      ctx.beginPath();
      ctx.moveTo(-8, row * 4.2);
      ctx.bezierCurveTo(-4, row * 4.2 - 3, 0, row * 4.2 + 3, 8, row * 4.2);
      ctx.stroke();
    }
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 0.9;
    ctx.stroke();
  } else if (item.glyph === 'rice') {
    for (let i = 0; i < 6; i += 1) {
      const a = i * 1.9;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 5.5, Math.sin(a) * 5.5, 2.4, 1.5, a, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? item.color : '#fff8e3';
      ctx.fill();
    }
  } else if (item.glyph === 'leaf') {
    ctx.beginPath();
    ctx.moveTo(-8, 7);
    ctx.quadraticCurveTo(-9, -8, 8, -7);
    ctx.quadraticCurveTo(8, 7, -8, 7);
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, 6);
    ctx.quadraticCurveTo(0, 0, 6, -5);
    ctx.stroke();
  } else if (item.glyph === 'egg') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 9.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fff9ea';
    ctx.fill();
    ctx.strokeStyle = '#e4d4b5';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1, 1, 4, 0, Math.PI * 2);
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-0.5, -0.5, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff3b0';
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-2, -8);
    ctx.bezierCurveTo(7, -8, 9, -1, 5, 4);
    ctx.bezierCurveTo(2, 8, -4, 8, -5, 4);
    ctx.bezierCurveTo(-7, 0, -6, -4, -2, -8);
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, -8);
    ctx.quadraticCurveTo(-4, -11, -7, -10);
    ctx.strokeStyle = '#57c785';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawDish(ctx, recipe, x, y, scale = 1, withSteam = false, time = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (withSteam) {
    for (let i = 0; i < 3; i += 1) {
      const t = (time * 0.45 + i * 0.33) % 1;
      ctx.beginPath();
      ctx.ellipse(-10 + i * 10 + Math.sin(t * 6 + i) * 5, -18 - t * 34, 8 + t * 8, 12 + t * 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(226,244,236,${0.13 * (1 - t)})`;
      ctx.fill();
    }
  }
  ctx.beginPath();
  ctx.ellipse(0, 9, 30, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fdf8ea';
  ctx.fill();
  ctx.strokeStyle = '#cdbfa4';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -1, 22, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#efe4cb';
  ctx.fill();
  const color = recipe?.accent ?? '#e9b44c';
  ctx.beginPath();
  ctx.ellipse(0, -5, 18, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-2, -8, 14, 7, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fill();
  if (recipe) {
    const has = (id) => recipe.ingredients.includes(id);
    if (has('noodles')) {
      ctx.strokeStyle = has('chili') ? '#f3c25c' : '#e9b44c';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-15, -8 + i * 3.6);
        ctx.bezierCurveTo(-6, -11 + i * 3.6, 5, -5 + i * 3.6, 15, -8 + i * 3.6);
        ctx.stroke();
      }
    }
    if (has('egg')) {
      ctx.beginPath();
      ctx.ellipse(6, -11, 5, 3.2, -0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#fff9ea';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6.5, -11, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#f7c948';
      ctx.fill();
    }
    if (has('greens')) {
      ctx.beginPath();
      ctx.moveTo(-12, -12);
      ctx.quadraticCurveTo(-7, -17, -1, -14);
      ctx.quadraticCurveTo(-5, -9, -12, -12);
      ctx.fillStyle = '#57c785';
      ctx.fill();
    }
    if (has('chili')) {
      for (let i = 0; i < 2; i += 1) {
        ctx.beginPath();
        ctx.ellipse(-2 + i * 8, -3 - i * 2, 2.8, 1.5, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#c53a2a';
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.ellipse(12, -14, 4.5, 2.2, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = recipe.garnish;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-16, -4, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff8dd';
    ctx.fill();
  }
  ctx.restore();
}

function drawLantern(ctx, x, y, size, color, time, phase = 0) {
  const sway = Math.sin(time * 1.1 + phase) * 2;
  ctx.save();
  ctx.translate(x + sway, y);
  const glow = ctx.createRadialGradient(0, size * 0.5, 2, 0, size * 0.5, size * 2.4);
  glow.addColorStop(0, 'rgba(255,166,76,0.35)');
  glow.addColorStop(1, 'rgba(255,166,76,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, size * 0.5, size * 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1b3a37';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, size * 0.55, size * 0.55, size * 0.65, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,25,18,0.55)';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.ellipse(0, size * 0.55, size * (0.22 + Math.abs(i) * 0.16), size * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(-size * 0.32, size * 0.02, size * 0.64, size * 0.14);
  ctx.fillRect(-size * 0.3, size * 1.08, size * 0.6, size * 0.12);
  ctx.strokeStyle = '#e9b44c';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, size * 1.2);
  ctx.lineTo(0, size * 1.5);
  ctx.stroke();
  ctx.restore();
}

function drawBackground(ctx, state) {
  const t = state.time;
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, 1280, 720);

  const wall = ctx.createLinearGradient(0, 78, 0, 646);
  wall.addColorStop(0, '#103033');
  wall.addColorStop(0.55, '#0b2325');
  wall.addColorStop(1, '#07191b');
  ctx.fillStyle = wall;
  ctx.fillRect(326, 78, 938, 568);

  ctx.strokeStyle = 'rgba(120,190,180,0.055)';
  ctx.lineWidth = 1;
  for (let x = 330; x < 1270; x += 58) {
    ctx.beginPath();
    ctx.moveTo(x, 78);
    ctx.lineTo(x, 646);
    ctx.stroke();
  }
  for (let y = 86; y < 646; y += 58) {
    ctx.beginPath();
    ctx.moveTo(326, y);
    ctx.lineTo(1264, y);
    ctx.stroke();
  }

  const floor = ctx.createLinearGradient(0, 430, 0, 646);
  floor.addColorStop(0, '#102b2d');
  floor.addColorStop(1, '#081719');
  ctx.fillStyle = floor;
  ctx.fillRect(326, 430, 938, 216);
  ctx.strokeStyle = 'rgba(120,190,180,0.05)';
  for (let x = 340; x < 1270; x += 74) {
    ctx.beginPath();
    ctx.moveTo(x, 430);
    ctx.lineTo(x - 46, 646);
    ctx.stroke();
  }

  const pool = ctx.createRadialGradient(520, 560, 20, 520, 560, 250);
  pool.addColorStop(0, 'rgba(255,171,74,0.10)');
  pool.addColorStop(1, 'rgba(255,171,74,0)');
  ctx.fillStyle = pool;
  ctx.fillRect(300, 400, 440, 246);
  const pool2 = ctx.createRadialGradient(1060, 570, 20, 1060, 570, 240);
  pool2.addColorStop(0, 'rgba(255,120,78,0.12)');
  pool2.addColorStop(1, 'rgba(255,120,78,0)');
  ctx.fillStyle = pool2;
  ctx.fillRect(820, 400, 460, 246);

  // Lantern string behind the top bar.
  ctx.strokeStyle = '#21413d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, 14);
  ctx.quadraticCurveTo(640, 56, 1290, 10);
  ctx.stroke();
  const lanterns = [
    [70, 26, 15, '#d94b33'], [205, 34, 17, '#e8a13c'], [348, 42, 14, '#d94b33'],
    [505, 46, 16, '#e8a13c'], [664, 44, 15, '#d94b33'], [820, 40, 17, '#e8a13c'],
    [972, 32, 14, '#d94b33'], [1122, 24, 16, '#e8a13c'], [1240, 18, 13, '#d94b33'],
  ];
  lanterns.forEach(([x, y, size, color], i) => drawLantern(ctx, x, y, size, color, t, i));
  drawLantern(ctx, 1168, 96, 20, '#d94b33', t, 3);
  drawLantern(ctx, 1002, 82, 16, '#e8a13c', t, 5);

  // Pass wall panel and hanging sign.
  fillRound(ctx, 944, 90, 316, 552, 16, 'rgba(10,31,33,0.7)');
  ctx.strokeStyle = 'rgba(140,200,185,0.12)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, 944, 90, 316, 552, 16);
  ctx.stroke();

  ctx.strokeStyle = '#28433e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1092, 90);
  ctx.lineTo(1092, 122);
  ctx.stroke();
  fillRound(ctx, 1046, 118, 92, 34, 8, '#123034');
  ctx.strokeStyle = '#e9b44c';
  ctx.lineWidth = 1.4;
  roundRect(ctx, 1046, 118, 92, 34, 8);
  ctx.stroke();
  label(ctx, 'PASS', 1092, 141, 15, '#f2c14e', { align: 'center', weight: 900, spacing: 3 });

  // Wall shelf with bowls and jars.
  ctx.fillStyle = '#2b4641';
  ctx.fillRect(962, 212, 152, 7);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(962, 219, 152, 3);
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.ellipse(982 + i * 32, 206, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? '#d8c9a9' : '#b7d9c4';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.stroke();
  }
  fillRound(ctx, 1088, 176, 20, 36, 6, '#3c5e54');
  fillRound(ctx, 1112, 184, 16, 28, 5, '#6f4632');
  label(ctx, 'CHILI OIL', 1112, 226, 6, '#8fa6a3', { align: 'center' });

  // Kitchen shelf line under the pantry.
  ctx.fillStyle = '#2b4641';
  ctx.fillRect(334, 184, 584, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(334, 192, 584, 4);

  // Hanging utensils.
  ctx.strokeStyle = 'rgba(180,215,205,0.2)';
  ctx.lineWidth = 2;
  [560, 600, 634].forEach((x, i) => {
    ctx.beginPath();
    ctx.moveTo(x, 200);
    ctx.lineTo(x, 222 + i * 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, 234 + i * 4, 8, 12, i * 0.2, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawCrates(ctx, state) {
  INGREDIENTS.forEach((item, i) => {
    const x = CRATE.x0 + i * CRATE.gap;
    const y = CRATE.y;
    const w = CRATE.w;
    const h = CRATE.h;
    ctx.save();
    const shadow = ctx.createRadialGradient(x + w / 2, y + h + 8, 4, x + w / 2, y + h + 8, 58);
    shadow.addColorStop(0, 'rgba(0,0,0,0.38)');
    shadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadow;
    ctx.fillRect(x - 10, y + h - 4, w + 20, 30);

    fillRound(ctx, x, y + 8, w, h - 8, 7, '#3b281d');
    const wood = ctx.createLinearGradient(x, y, x, y + h);
    wood.addColorStop(0, '#6b4630');
    wood.addColorStop(1, '#3c281d');
    fillRound(ctx, x + 2, y + 10, w - 4, h - 12, 6, wood);
    ctx.fillStyle = 'rgba(20,10,6,0.75)';
    fillRound(ctx, x + 7, y + 14, w - 14, 30, 4, 'rgba(15,9,6,0.8)');

    // Contents peeking out of the open crate.
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 8, y + 14, w - 16, 28);
    ctx.clip();
    if (item.glyph === 'noodle') {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      for (let r = 0; r < 4; r += 1) {
        ctx.beginPath();
        ctx.moveTo(x + 14, y + 22 + r * 5);
        ctx.bezierCurveTo(x + 34, y + 17 + r * 5, x + 56, y + 27 + r * 5, x + w - 14, y + 21 + r * 5);
        ctx.stroke();
      }
    } else if (item.glyph === 'rice') {
      for (let r = 0; r < 16; r += 1) {
        ctx.beginPath();
        ctx.ellipse(x + 16 + ((r * 37) % (w - 32)), y + 20 + ((r * 13) % 20), 2.2, 1.4, r, 0, Math.PI * 2);
        ctx.fillStyle = r % 3 ? '#f2e3bd' : '#fff8e0';
        ctx.fill();
      }
    } else if (item.glyph === 'leaf') {
      for (let r = 0; r < 5; r += 1) {
        ctx.beginPath();
        ctx.ellipse(x + 22 + r * 14, y + 26 + (r % 2) * 6, 10, 6, -0.5 + r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = r % 2 ? '#57c785' : '#3da56b';
        ctx.fill();
      }
    } else if (item.glyph === 'egg') {
      for (let r = 0; r < 4; r += 1) {
        ctx.beginPath();
        ctx.ellipse(x + 20 + r * 19, y + 27 + (r % 2) * 5, 8, 6, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = '#fff6dd';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 20 + r * 19, y + 27 + (r % 2) * 5, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = '#f7c948';
        ctx.fill();
      }
    } else {
      for (let r = 0; r < 5; r += 1) {
        ctx.beginPath();
        ctx.moveTo(x + 16 + r * 15, y + 20);
        ctx.quadraticCurveTo(x + 24 + r * 15, y + 28, x + 19 + r * 15, y + 37);
        ctx.quadraticCurveTo(x + 10 + r * 15, y + 28, x + 16 + r * 15, y + 20);
        ctx.fillStyle = r % 2 ? '#e8553f' : '#c53a2a';
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,210,150,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 48);
    ctx.lineTo(x + w - 4, y + 48);
    ctx.stroke();
    for (let s = 0; s < 2; s += 1) {
      ctx.fillStyle = 'rgba(30,18,12,0.55)';
      ctx.fillRect(x + 4, y + 56 + s * 10, w - 8, 3);
    }
    ctx.fillStyle = 'rgba(230,205,160,0.18)';
    ctx.fillRect(x + 3, y + 9, w - 6, 2);
    ctx.strokeStyle = 'rgba(20,12,8,0.8)';
    ctx.lineWidth = 2;
    roundRect(ctx, x + 1, y + 9, w - 2, h - 10, 6);
    ctx.stroke();

    fillRound(ctx, x + 10, y + 50, w - 20, 20, 3, '#efe0bf');
    ctx.strokeStyle = '#b39a70';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 10, y + 50, w - 20, 20, 3);
    ctx.stroke();
    drawIngredient(ctx, item.id, x + 20, y + 60, 11);
    label(ctx, item.label, x + w / 2 + 7, y + 64, 8.4, '#3b2b1d', { align: 'center', weight: 900 });

    if (state.chef.y < 300 && Math.abs(state.chef.x - (x + w / 2)) < 60) {
      ctx.strokeStyle = 'rgba(255,196,96,0.55)';
      ctx.lineWidth = 2;
      roundRect(ctx, x - 2, y + 7, w + 4, h - 6, 8);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawCuttingStation(ctx, state) {
  const t = state.time;
  const x = 392;
  const y = 318;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(456, 400, 72, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a271d';
  ctx.fillRect(x + 12, y + 26, 12, 58);
  ctx.fillRect(x + 104, y + 26, 12, 58);
  ctx.fillStyle = '#5a3a27';
  ctx.fillRect(x + 8, y + 20, 116, 12);
  const top = ctx.createLinearGradient(0, y - 10, 0, y + 22);
  top.addColorStop(0, '#8a5f3d');
  top.addColorStop(1, '#5c3d2b');
  fillRound(ctx, x, y - 10, 132, 30, 5, top);
  ctx.strokeStyle = '#2e1d15';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y - 10, 132, 30, 5);
  ctx.stroke();

  // Cutting board.
  fillRound(ctx, x + 12, y - 22, 108, 30, 8, '#c9a46a');
  ctx.strokeStyle = '#8d6a3d';
  ctx.lineWidth = 1.6;
  roundRect(ctx, x + 12, y - 22, 108, 30, 8);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(110,80,44,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 24, y - 15 + i * 7);
    ctx.lineTo(x + 104, y - 15 + i * 7);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x + 110, y - 7, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#8d6a3d';
  ctx.fill();

  const chopped = state.bowl.chopped || state.bowl.chopping;
  if (chopped) {
    state.bowl.ingredients.slice(0, 3).forEach((id, i) => {
      const item = ingredientById(id);
      for (let j = 0; j < 4; j += 1) {
        const bx = x + 36 + i * 26 + ((j * 7) % 14);
        const by = y - 10 + ((j * 5) % 8);
        ctx.beginPath();
        ctx.ellipse(bx, by, 3.4, 2.2, j, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
      }
    });
  }

  // Knife: idles on the board, swings while chopping.
  const swing = state.bowl.chopping ? -0.9 + Math.sin(t * 26) * 0.55 : -0.12;
  ctx.save();
  ctx.translate(x + 88, y - 20);
  ctx.rotate(swing);
  fillRound(ctx, 2, -5, 22, 7, 3, '#3a2418');
  ctx.beginPath();
  ctx.moveTo(-28, -8);
  ctx.quadraticCurveTo(-10, -12, 2, -3);
  ctx.lineTo(-2, 7);
  ctx.quadraticCurveTo(-16, 5, -28, -8);
  ctx.fillStyle = '#cfdcd6';
  ctx.fill();
  ctx.strokeStyle = '#6e8580';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.moveTo(-24, -7);
  ctx.lineTo(-8, -2);
  ctx.stroke();
  ctx.restore();

  // Scrap bowl.
  ctx.beginPath();
  ctx.ellipse(x + 28, y - 4, 14, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#1b2d2b';
  ctx.fill();
  ctx.strokeStyle = '#6f8f88';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  label(ctx, 'CUT', x + 62, y + 54, 8, 'rgba(143,166,163,0.75)', { align: 'center', spacing: 2 });
  ctx.restore();
}

function drawFlame(ctx, x, y, w, h, time, intensity = 1) {
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, 2, x, y, w * 1.15);
  glow.addColorStop(0, `rgba(255,150,52,${0.34 * intensity})`);
  glow.addColorStop(0.55, `rgba(255,96,40,${0.14 * intensity})`);
  glow.addColorStop(1, 'rgba(255,96,40,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, w * 1.15, 0, Math.PI * 2);
  ctx.fill();

  for (let layer = 0; layer < 3; layer += 1) {
    const scale = 1 - layer * 0.24;
    const sway = Math.sin(time * (7 + layer) + layer * 2) * 6;
    const height = h * scale * (0.85 + Math.sin(time * 11 + layer) * 0.12) * intensity;
    ctx.beginPath();
    ctx.moveTo(x - w * scale * 0.52, y + 4);
    ctx.quadraticCurveTo(x - w * scale * 0.58 + sway, y - height * 0.45, x + sway * 0.4, y - height);
    ctx.quadraticCurveTo(x + w * scale * 0.56 + sway, y - height * 0.42, x + w * scale * 0.52, y + 4);
    ctx.closePath();
    const grad = ctx.createLinearGradient(x, y, x, y - height);
    if (layer === 0) {
      grad.addColorStop(0, '#e34a22');
      grad.addColorStop(0.6, '#ff8b2e');
      grad.addColorStop(1, '#ffc85c');
    } else if (layer === 1) {
      grad.addColorStop(0, '#ff8b2e');
      grad.addColorStop(1, '#ffd77a');
    } else {
      grad.addColorStop(0, '#ffd77a');
      grad.addColorStop(1, '#fff4c9');
    }
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();
}

function drawWokStation(ctx, state) {
  const t = state.time;
  const x = 694;
  const bowl = state.bowl;
  const cooking = bowl.ingredients.length > 0;
  ctx.save();
  const glow = ctx.createRadialGradient(x, 348, 8, x, 348, 128);
  glow.addColorStop(0, 'rgba(255,150,60,0.22)');
  glow.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 140, 220, 280, 220);

  // Stove base.
  fillRound(ctx, x - 72, 346, 144, 52, 9, '#26322f');
  ctx.strokeStyle = '#435854';
  ctx.lineWidth = 2;
  roundRect(ctx, x - 72, 346, 144, 52, 9);
  ctx.stroke();
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i % 2 ? 'rgba(255,120,60,0.4)' : 'rgba(255,180,80,0.25)';
    ctx.fillRect(x - 50 + i * 22, 380, 12, 5);
  }
  ctx.beginPath();
  ctx.arc(x + 56, 362, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#6f8580';
  ctx.fill();

  const intensity = 0.75 + (bowl.stir ? 0.35 : 0) + Math.min(0.2, bowl.heat * 0.2);
  drawFlame(ctx, x, 356, 74, 66, t, intensity);

  // Wok.
  ctx.beginPath();
  ctx.ellipse(x, 332, 64, 26, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#151b1a';
  ctx.fill();
  ctx.strokeStyle = '#3f4f4b';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, 330, 52, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#232d2a';
  ctx.fill();
  if (cooking) {
    const recipe = RECIPES.find((r) => [...r.ingredients].sort().join() === [...bowl.ingredients].sort().join());
    ctx.beginPath();
    ctx.ellipse(x, 328, 44, 13, 0, 0, Math.PI * 2);
    ctx.fillStyle = recipe?.accent ?? '#8f7a58';
    ctx.fill();
    bowl.ingredients.slice(0, 3).forEach((id, i) => {
      drawIngredient(ctx, id, x - 24 + i * 24, 326 + (i % 2) * 4, 12);
    });
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, 328, 44, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Handles.
  ctx.strokeStyle = '#566b66';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 62, 330);
  ctx.lineTo(x - 88, 322);
  ctx.moveTo(x + 62, 330);
  ctx.lineTo(x + 88, 322);
  ctx.stroke();
  label(ctx, 'WOK', x, 414, 8, 'rgba(143,166,163,0.75)', { align: 'center', spacing: 2 });
  ctx.restore();
}

function drawPrepBowl(ctx, state) {
  const bowl = state.bowl;
  if (bowl.ingredients.length === 0 || bowl.cooked || bowl.burnt) return;
  const x = 566;
  const y = 372;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(x, 438, 46, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a271d';
  ctx.fillRect(x - 40, 406, 7, 32);
  ctx.fillRect(x + 33, 406, 7, 32);
  const top = ctx.createLinearGradient(0, y + 12, 0, y + 46);
  top.addColorStop(0, '#7a5236');
  top.addColorStop(1, '#4a3022');
  fillRound(ctx, x - 46, y + 12, 92, 24, 5, top);
  ctx.strokeStyle = '#2b1c14';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x - 46, y + 12, 92, 24, 5);
  ctx.stroke();
  label(ctx, 'MISE', x, y + 52, 6.5, 'rgba(143,166,163,0.65)', { align: 'center', spacing: 1.4 });

  ctx.beginPath();
  ctx.ellipse(x, y, 31, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#16211f';
  ctx.fill();
  ctx.strokeStyle = '#59716b';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 25, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#dbe5d8';
  ctx.fill();
  bowl.ingredients.slice(0, 3).forEach((id, i) => {
    drawIngredient(ctx, id, x - 14 + i * 14, y - 5 + (i % 2) * 3, 13);
  });
  ctx.strokeStyle = '#c9a46a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 20, y - 12);
  ctx.lineTo(x + 40, y - 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + 42, y - 32, 4, 2.6, 0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#c9a46a';
  ctx.fill();
  ctx.restore();
}

function drawTrash(ctx) {
  ctx.save();
  const x = 868;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, 582, 38, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  const metal = ctx.createLinearGradient(x - 32, 0, x + 32, 0);
  metal.addColorStop(0, '#3b4c49');
  metal.addColorStop(0.5, '#5d7570');
  metal.addColorStop(1, '#33433f');
  fillRound(ctx, x - 32, 516, 64, 62, 7, metal);
  ctx.strokeStyle = '#263633';
  ctx.lineWidth = 2;
  roundRect(ctx, x - 32, 516, 64, 62, 7);
  ctx.stroke();
  fillRound(ctx, x - 36, 508, 72, 13, 5, '#6e8781');
  ctx.strokeStyle = '#2b3a37';
  roundRect(ctx, x - 36, 508, 72, 13, 5);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(20,30,28,0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 20 + i * 20, 526);
    ctx.lineTo(x - 20 + i * 20, 566);
    ctx.stroke();
  }
  label(ctx, 'TRASH', x, 545, 8, '#c7d8d3', { align: 'center', spacing: 1 });
  ctx.restore();
}

function drawPass(ctx, state) {
  const t = state.time;
  const x = 1088;
  // Heat lamp.
  ctx.strokeStyle = '#40534e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(1216, 372);
  ctx.lineTo(1216, 214);
  ctx.quadraticCurveTo(1216, 196, 1198, 196);
  ctx.lineTo(1124, 196);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1124, 196);
  ctx.lineTo(1110, 214);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(1094, 224, 36, 18, 0, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#b6412c';
  ctx.fill();
  ctx.strokeStyle = '#7e2a1e';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(1094, 224, 28, 12, 0, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#e8a13c';
  ctx.fill();
  const lampGlow = ctx.createRadialGradient(1094, 236, 3, 1094, 236, 46);
  lampGlow.addColorStop(0, 'rgba(255,220,140,0.95)');
  lampGlow.addColorStop(1, 'rgba(255,160,70,0)');
  ctx.fillStyle = lampGlow;
  ctx.beginPath();
  ctx.arc(1094, 236, 46, 0, Math.PI * 2);
  ctx.fill();
  const cone = ctx.createLinearGradient(1094, 230, 1094, 380);
  cone.addColorStop(0, 'rgba(255,177,80,0.30)');
  cone.addColorStop(1, 'rgba(255,177,80,0.02)');
  ctx.beginPath();
  ctx.moveTo(1064, 236);
  ctx.lineTo(1010, 384);
  ctx.lineTo(1178, 384);
  ctx.lineTo(1124, 236);
  ctx.closePath();
  ctx.fillStyle = cone;
  ctx.fill();

  // Open-late sign on the back wall (kept out of the title card's way).
  if (state.screen !== 'title') {
    ctx.save();
    ctx.shadowColor = 'rgba(255,150,60,0.55)';
    ctx.shadowBlur = 18;
    fillRound(ctx, 786, 224, 120, 54, 8, 'rgba(10,31,32,0.95)');
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,179,71,0.55)';
    ctx.lineWidth = 1.4;
    roundRect(ctx, 786, 224, 120, 54, 8);
    ctx.stroke();
    label(ctx, 'OPEN LATE', 846, 250, 12, '#ffd784', { align: 'center', weight: 900, spacing: 1.6 });
    label(ctx, 'TILL THE WOK RUNS DRY', 846, 266, 6, 'rgba(255,215,132,0.6)', { align: 'center', spacing: 0.8 });
    ctx.beginPath();
    ctx.arc(796, 240, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#e2543c';
    ctx.fill();
    ctx.restore();
  }

  // Pass counter.
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, 432, 122, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  const steel = ctx.createLinearGradient(0, 388, 0, 436);
  steel.addColorStop(0, '#718783');
  steel.addColorStop(1, '#3e514d');
  fillRound(ctx, 974, 388, 228, 46, 8, steel);
  ctx.strokeStyle = '#2b3c39';
  ctx.lineWidth = 2;
  roundRect(ctx, 974, 388, 228, 46, 8);
  ctx.stroke();
  ctx.fillStyle = 'rgba(230,245,238,0.22)';
  ctx.fillRect(980, 392, 216, 3);
  for (let i = 0; i < 3; i += 1) {
    ctx.strokeStyle = 'rgba(20,30,28,0.3)';
    ctx.beginPath();
    ctx.moveTo(1010 + i * 80, 402);
    ctx.lineTo(1010 + i * 80, 424);
    ctx.stroke();
  }
  label(ctx, 'PLATING PASS', x, 456, 8, 'rgba(143,166,163,0.8)', { align: 'center', spacing: 2 });

  // Plate on the pass.
  if (state.plate) {
    const recipe = recipeById(state.plate.recipeId);
    drawDish(ctx, recipe, x, 370, 1.55, true, t);
    const shine = 0.5 + Math.sin(t * 4) * 0.3;
    ctx.beginPath();
    ctx.arc(x + 30, 356, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,250,220,${shine})`;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 30, 350);
    ctx.lineTo(x + 30, 362);
    ctx.moveTo(x + 24, 356);
    ctx.lineTo(x + 36, 356);
    ctx.strokeStyle = `rgba(255,250,220,${shine * 0.7})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(x, 378, 52, 13, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e9dfc8';
    ctx.fill();
    ctx.strokeStyle = '#b9ab8c';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, 377, 38, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f6eedb';
    ctx.fill();
  }

  // Mini ticket above the hatch when a plate waits.
  if (state.plate) {
    const recipe = recipeById(state.plate.recipeId);
    ctx.save();
    ctx.translate(1092, 456);
    ctx.rotate(-0.015);
    fillRound(ctx, -84, -22, 168, 46, 5, '#f3e7cb');
    ctx.strokeStyle = '#cbb78e';
    ctx.lineWidth = 1;
    roundRect(ctx, -84, -22, 168, 46, 5);
    ctx.stroke();
    label(ctx, 'READY AT THE HATCH', 0, -8, 7, '#9c2f21', { align: 'center', weight: 900, spacing: 1 });
    label(ctx, recipe.name, 0, 12, 12, '#2a2018', { align: 'center', weight: 900 });
    ctx.restore();
  }

  // Serve hatch.
  fillRound(ctx, 1004, 500, 176, 112, 9, '#22322f');
  ctx.strokeStyle = '#516a64';
  ctx.lineWidth = 3;
  roundRect(ctx, 1004, 500, 176, 112, 9);
  ctx.stroke();
  const hatchGlow = ctx.createLinearGradient(0, 514, 0, 600);
  hatchGlow.addColorStop(0, '#ffcf7a');
  hatchGlow.addColorStop(0.45, '#e88b3c');
  hatchGlow.addColorStop(1, '#7e3a20');
  fillRound(ctx, 1016, 512, 152, 88, 5, hatchGlow);
  ctx.fillStyle = 'rgba(60,30,16,0.42)';
  ctx.fillRect(1016, 512, 152, 18);
  ctx.fillStyle = 'rgba(255,244,200,0.18)';
  for (let i = 0; i < 5; i += 1) ctx.fillRect(1028 + i * 28, 520, 14, 3);
  label(ctx, 'SERVE', 1092, 558, 22, '#4a2414', { align: 'center', weight: 900, spacing: 4 });
  label(ctx, 'NIGHT MARKET', 1092, 578, 7, 'rgba(74,36,20,0.7)', { align: 'center', spacing: 2 });
  ctx.fillStyle = '#d7e0d9';
  fillRound(ctx, 1096, 584, 52, 6, 3, '#d7e0d9');
  ctx.strokeStyle = '#3b4b47';
  ctx.lineWidth = 1;
  roundRect(ctx, 1096, 584, 52, 6, 3);
  ctx.stroke();
  ctx.fillStyle = 'rgba(20,30,28,0.5)';
  ctx.fillRect(1004, 496, 176, 4);
}

function drawChef(ctx, state) {
  const chef = state.chef;
  const t = state.time;
  const moving = Math.hypot(chef.vx, chef.vy) > 30;
  const bob = moving ? Math.sin(chef.walk) * 2.4 : Math.sin(t * 2.4) * 0.8;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 42, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.scale(chef.face * (1 + (1 - chef.squash) * 0.14), chef.squash);

  // Legs and shoes.
  fillRound(ctx, -14, 22, 11, 20, 5, '#22322f');
  fillRound(ctx, 4, 22, 11, 20, 5, '#22322f');
  fillRound(ctx, -17, 38, 16, 7, 3, '#151d1c');
  fillRound(ctx, 2, 38, 16, 7, 3, '#151d1c');

  // Torso and apron.
  ctx.beginPath();
  ctx.ellipse(0, 2, 27, 31, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#efe3c8';
  ctx.fill();
  ctx.strokeStyle = '#c9b790';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  fillRound(ctx, -19, -2, 38, 34, 9, '#235b52');
  ctx.strokeStyle = '#164038';
  ctx.lineWidth = 1.4;
  roundRect(ctx, -19, -2, 38, 34, 9);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(150,220,190,0.4)';
  ctx.beginPath();
  ctx.moveTo(-14, 4);
  ctx.lineTo(14, 4);
  ctx.stroke();
  ctx.fillStyle = '#e8c46a';
  ctx.fillRect(-4, 14, 8, 3);

  // Scarf.
  fillRound(ctx, -16, -24, 32, 9, 4, '#c9412d');
  ctx.beginPath();
  ctx.moveTo(10, -18);
  ctx.lineTo(20, -10);
  ctx.lineTo(14, -6);
  ctx.closePath();
  ctx.fillStyle = '#c9412d';
  ctx.fill();

  // Head.
  ctx.beginPath();
  ctx.arc(0, -37, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#e9b98a';
  ctx.fill();
  ctx.strokeStyle = '#b98559';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-15, -37, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#dca477';
  ctx.fill();

  // Face.
  ctx.fillStyle = '#33241c';
  ctx.beginPath();
  ctx.arc(-6, -40, 2, 0, Math.PI * 2);
  ctx.arc(6, -40, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7d5238';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -34, 6, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.fillStyle = 'rgba(210,120,90,0.35)';
  ctx.beginPath();
  ctx.arc(-11, -34, 3.5, 0, Math.PI * 2);
  ctx.arc(11, -34, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Toque.
  fillRound(ctx, -17, -62, 34, 10, 4, '#f8f0dd');
  ctx.beginPath();
  ctx.ellipse(0, -70, 21, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fdf7e8';
  ctx.fill();
  ctx.strokeStyle = '#d9cdb3';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-10, -74, 6, 0, Math.PI * 2);
  ctx.arc(0, -78, 7, 0, Math.PI * 2);
  ctx.arc(10, -74, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#fffaf0';
  ctx.fill();
  ctx.strokeStyle = '#c9412d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, -62);
  ctx.lineTo(18, -62);
  ctx.stroke();

  // Arms: one holds the cleaver, the other balances.
  const swing = chef.swing;
  ctx.save();
  ctx.translate(20, -4);
  ctx.rotate(-0.5 - swing * 1.2 + (state.bowl.stir ? Math.sin(chef.stirT) * 0.7 : 0));
  ctx.strokeStyle = '#e9b98a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(13, 9);
  ctx.stroke();
  fillRound(ctx, 10, 5, 14, 8, 3, '#e9b98a');
  ctx.save();
  ctx.translate(22, 9);
  ctx.rotate(0.2);
  fillRound(ctx, -2, -3, 14, 6, 2, '#3a2418');
  ctx.beginPath();
  ctx.moveTo(-14, -10);
  ctx.lineTo(-2, -6);
  ctx.lineTo(-2, 6);
  ctx.lineTo(-14, 2);
  ctx.closePath();
  ctx.fillStyle = '#d3e0da';
  ctx.fill();
  ctx.strokeStyle = '#6b8580';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  ctx.save();
  ctx.translate(-22, -2);
  ctx.rotate(0.4 + (moving ? Math.sin(chef.walk) * 0.25 : 0));
  ctx.strokeStyle = '#e9b98a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-11, 10);
  ctx.stroke();
  fillRound(ctx, -16, 6, 12, 8, 3, '#e9b98a');
  ctx.restore();

  ctx.restore();
}

function drawParticles(ctx, state) {
  state.particles.forEach((p) => {
    const alpha = Math.max(0, Math.min(1, p.life / Math.max(0.01, p.max)));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    if (p.kind === 'steam') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * (1.3 - alpha * 0.3), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(226,244,236,0.20)';
      ctx.fill();
    } else if (p.kind === 'spark') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    } else if (p.kind === 'coin') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd784';
      ctx.fill();
      ctx.strokeStyle = '#b17b22';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.restore();
  });

  state.popups.forEach((popup) => {
    const alpha = Math.max(0, Math.min(1, popup.life / 0.5));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `900 ${popup.size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(8,20,20,0.85)';
    ctx.strokeText(popup.text, popup.x, popup.y);
    ctx.fillStyle = popup.color;
    ctx.fillText(popup.text, popup.x, popup.y);
    ctx.restore();
  });
}

function drawMeters(ctx, state) {
  const bowl = state.bowl;
  const drawBar = (x, y, width, labelText, value, green, color) => {
    fillRound(ctx, x - width / 2 - 8, y - 13, width + 16, 30, 6, 'rgba(7,20,21,0.85)');
    ctx.strokeStyle = 'rgba(130,190,175,0.25)';
    ctx.lineWidth = 1;
    roundRect(ctx, x - width / 2 - 8, y - 13, width + 16, 30, 6);
    ctx.stroke();
    label(ctx, labelText, x - width / 2, y - 2, 7, '#9fb8b2', { spacing: 1 });
    ctx.fillStyle = '#132a2b';
    ctx.fillRect(x - width / 2, y + 2, width, 8);
    ctx.fillStyle = 'rgba(89,195,139,0.32)';
    ctx.fillRect(x - width / 2 + width * green[0], y + 2, width * (green[1] - green[0]), 8);
    ctx.fillStyle = color;
    const px = x - width / 2 + Math.max(0, Math.min(1, value)) * width;
    ctx.fillRect(px - 1.5, y, 3, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(px - 0.5, y + 1, 1, 10);
  };

  if (bowl.chopping) drawBar(452, 258, 108, 'CHOP', bowl.chopNeedle, TIMINGS.chopGreen, '#ffd784');
  if (bowl.ingredients.length > 0 || bowl.stir) {
    drawBar(694, 238, 108, 'HEAT', bowl.heat, TIMINGS.heatGreen, bowl.burnt ? '#ff8f76' : '#ffb347');
  }
}

export function drawWorld(ctx, state) {
  drawBackground(ctx, state);
  drawCrates(ctx, state);
  drawCuttingStation(ctx, state);
  drawWokStation(ctx, state);
  drawPrepBowl(ctx, state);
  drawTrash(ctx);
  drawPass(ctx, state);
  drawChef(ctx, state);
  drawMeters(ctx, state);
  drawParticles(ctx, state);

  const vignette = ctx.createRadialGradient(640, 340, 260, 640, 360, 760);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1280, 720);

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(226,84,60,${state.flash * 0.22})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
  if (state.servedFlash > 0) {
    ctx.fillStyle = `rgba(255,215,132,${state.servedFlash * 0.1})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
}
