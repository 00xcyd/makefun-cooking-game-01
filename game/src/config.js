// Wok Luck — all tuning, recipes, stations and colours in one place.
// The playfield is a fixed 1280x720 logical canvas; the page scales it to fit.

export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 90;

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 78 },
  board: { x: 14, y: 86, w: 302, h: 556 },
  kitchen: { x: 326, y: 86, w: 600, h: 560 },
  pass: { x: 936, y: 86, w: 330, h: 560 },
  bottomBar: { x: 0, y: 646, w: 1280, h: 74 },
};

export const INGREDIENTS = [
  { id: 'noodles', label: 'NOODLES', short: 'NOO', color: '#e9b44c', dark: '#96661c', glyph: 'noodle' },
  { id: 'rice', label: 'RICE', short: 'RIC', color: '#f2e3bd', dark: '#a68c58', glyph: 'rice' },
  { id: 'greens', label: 'GREENS', short: 'GRE', color: '#57c785', dark: '#2b7447', glyph: 'leaf' },
  { id: 'egg', label: 'EGG', short: 'EGG', color: '#ffd75e', dark: '#bd8a18', glyph: 'egg' },
  { id: 'chili', label: 'CHILI', short: 'CHI', color: '#e8553f', dark: '#8f2318', glyph: 'chili' },
];

export const RECIPES = [
  {
    id: 'midnight', name: 'Midnight Noodles', short: 'Midnight',
    ingredients: ['noodles', 'greens', 'chili'],
    payout: 120, accent: '#e9b44c', garnish: '#57c785',
  },
  {
    id: 'fried-rice', name: 'Egg Fried Rice', short: 'Fried Rice',
    ingredients: ['rice', 'egg', 'greens'],
    payout: 130, accent: '#ffd75e', garnish: '#57c785',
  },
  {
    id: 'chili-egg', name: 'Chili Egg Noodles', short: 'Chili Egg',
    ingredients: ['noodles', 'egg', 'chili'],
    payout: 140, accent: '#e8553f', garnish: '#ffd75e',
  },
  {
    id: 'garden', name: 'Garden Rice', short: 'Garden',
    ingredients: ['rice', 'greens', 'chili'],
    payout: 110, accent: '#57c785', garnish: '#e8553f',
  },
];

export const STATIONS = {
  chefStart: { x: 622, y: 500 },
  board: { x: 452, y: 356, radius: 118 },
  wok: { x: 694, y: 350, radius: 122 },
  trash: { x: 868, y: 548, radius: 104 },
  pass: { x: 1088, y: 400, radius: 126 },
  hatch: { x: 1092, y: 556, radius: 118 },
};

export const CRATE = { w: 100, h: 78, x0: 344, gap: 112, y: 96, frontY: 226 };
export const CRATE_CENTERS = INGREDIENTS.map((_, i) => ({
  x: CRATE.x0 + CRATE.w / 2 + i * CRATE.gap,
  y: CRATE.y + CRATE.h / 2,
}));

export const MOVEMENT = { speed: 330, minX: 348, maxX: 1228, minY: 220, maxY: 612 };
export const CHEF = { radius: 24, reach: 124 };

export const TIMINGS = {
  patienceMin: 44,
  patienceMax: 60,
  ticketGap: 8,
  ticketHold: 1.8,
  maxBowl: 4,
  chopSweep: 0.86,
  chopGreen: [0.55, 0.8],
  heatRise: 0.52,
  heatCool: 0.26,
  heatGreen: [0.5, 0.78],
  heatBurn: 0.97,
  wrongServePenalty: 5,
  serveHold: 1.7,
  newTicketWarning: 10,
};

export const PALETTE = {
  bg: '#061416',
  wall: '#0c2426',
  wallLit: '#123235',
  wallDeep: '#091c1e',
  floor: '#0b1f21',
  floorLit: '#123033',
  wood: '#5c3d2b',
  woodDark: '#33221a',
  woodLight: '#8a5f3d',
  counter: '#25413d',
  counterEdge: '#3d665d',
  paper: '#f3e7cb',
  paperShade: '#e3d3ae',
  ink: '#2a2018',
  inkSoft: '#6f5b43',
  amber: '#ffb347',
  amberHot: '#ffd784',
  gold: '#f2c14e',
  red: '#e2543c',
  redDark: '#9c2f21',
  jade: '#59c38b',
  jadeDark: '#2c7a51',
  cream: '#fbf1d8',
  muted: '#8fa6a3',
  mutedDark: '#4c6563',
  steel: '#8da3a0',
  steelDark: '#4d605e',
  black: '#101312',
  white: '#fffaf0',
};

export const FONT = 'ui-rounded, "Avenir Next", "Trebuchet MS", system-ui, sans-serif';
export const MONO = '"SF Mono", "Menlo", "Consolas", monospace';

export const RANKS = [
  { min: 3600, title: 'Dragon Chef', blurb: 'The night market bows.' },
  { min: 2500, title: 'Wok Legend', blurb: 'Every ticket, every time.' },
  { min: 1600, title: 'Night Market Pro', blurb: 'The rush is yours.' },
  { min: 800, title: 'Line Cook', blurb: 'A steady flame.' },
  { min: 0, title: 'Street Cook', blurb: 'Every stall starts somewhere.' },
];

export const BEST_KEY = 'wok-luck.best';
