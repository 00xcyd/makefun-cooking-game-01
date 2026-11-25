// Keyboard, pointer and station picking. The canvas is scaled with CSS, so pointer
// coordinates are converted back into the fixed 1280x720 playfield here.

import { FIELD } from './config.js';

const LEFT = ['KeyA', 'ArrowLeft'];
const RIGHT = ['KeyD', 'ArrowRight'];
const UP = ['KeyW', 'ArrowUp'];
const DOWN = ['KeyS', 'ArrowDown'];

export const KEYS = {
  interact: 'KeyE',
  chop: 'Space',
  pause: 'KeyP',
  mute: 'KeyM',
  confirm: 'Enter',
  restart: 'Enter',
};

export function createInput(canvas) {
  const down = new Set();
  const pressed = new Set();
  const clicks = [];
  const pointer = { x: 0, y: 0, down: false, inside: false };

  function toField(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = FIELD.width / Math.max(1, rect.width);
    const scaleY = FIELD.height / Math.max(1, rect.height);
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (!event.repeat) pressed.add(event.code);
    down.add(event.code);
    if (event.code === 'Space' || event.code.startsWith('Arrow')) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    down.delete(event.code);
  });
  window.addEventListener('blur', () => {
    down.clear();
    pointer.down = false;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const point = toField(event);
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.down = true;
    pointer.inside = true;
    clicks.push({ x: point.x, y: point.y, button: event.button });
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    const point = toField(event);
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.inside = true;
  });
  canvas.addEventListener('pointerup', (event) => {
    pointer.down = false;
    if (event.pointerId !== undefined) canvas.releasePointerCapture?.(event.pointerId);
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false;
    pointer.down = false;
  });

  return {
    pointer,
    down: (code) => down.has(code),
    pressed: (code) => pressed.has(code),
    axisX: () => (LEFT.some((key) => down.has(key)) ? -1 : 0) + (RIGHT.some((key) => down.has(key)) ? 1 : 0),
    axisY: () => (UP.some((key) => down.has(key)) ? -1 : 0) + (DOWN.some((key) => down.has(key)) ? 1 : 0),
    takeClicks: () => clicks.splice(0, clicks.length),
    endFrame: () => pressed.clear(),
  };
}
