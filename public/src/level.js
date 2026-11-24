import { H } from './config.js';

const LEN = 1200; // car length MORE

export const cars = [
  {
    name: 'CAR 1 : PASSENGER CABIN',
    width: LEN,
    spawn: { x: 24, y: 200 },
    theme: { wall: 'interior', base: '#21262D', tint: 'rgba(13,17,23,0.62)', trim: null },
    solids: [
      { x: 0, y: 220, w: LEN, h: 50 },       // floor
      { x: 0, y: 0, w: LEN, h: 30 },         // ceiling
      { x: 0, y: 0, w: 8, h: H },            // left wall
      { x: LEN - 12, y: 0, w: 12, h: 160 },  // right wall above the door
      { x: 120, y: 200, w: 44, h: 20 },      // seat bench
      { x: 500, y: 196, w: 24, h: 24 },      // gauntlet crates
      { x: 590, y: 184, w: 24, h: 36 },
      { x: 690, y: 196, w: 24, h: 24 },
      { x: 780, y: 184, w: 24, h: 36 },
      { x: 880, y: 196, w: 24, h: 24 },
    ],
    levers: [{ x: 410, y: 206, w: 8, h: 14, used: false }],
  sw: { x: LEN - 40, y: 204, w: 10, h: 16, on: false },
     door: { x: LEN - 12, y: 160, w: 12, h: 60, open: false },
    turrets: [
      { x: 220, y: 30, cd: 1.0, rate: 1.5, speed: 120 },                              // warm-up
      { x: 480, y: 30, cd: 0.3, rate: 1.0, speed: 180, lead: 0.5 },                   // gauntlet
      { x: 580, y: 30, cd: 0.7, rate: 1.0, speed: 180, lead: 0.5, spread: 2 },
      { x: 680, y: 30, cd: 0.1, rate: 1.0, speed: 180, lead: 0.5 },
      { x: 780, y: 30, cd: 0.5, rate: 1.0, speed: 180, lead: 0.5, spread: 2 },
      { x: 880, y: 30, cd: 0.9, rate: 1.0, speed: 180, lead: 0.5 },
      { x: 1050, y: 30, cd: 1.0, rate: 1.4, speed: 150 },                             // last stretch
    ],
  },

    {
    name: 'CAR 2 : DINING CAR',
    width: 900,
    spawn: { x: 24, y: 200 },
    theme: { wall: 'dining', base: '#2A1018', tint: 'rgba(32,6,18,0.6)', trim: '#C9A227' },
    solids: [
      { x: 0, y: 220, w: 900, h: 50 },
      { x: 0, y: 0, w: 900, h: 30 },
      { x: 0, y: 0, w: 8, h: H },
      { x: 888, y: 0, w: 12, h: 160 },
      { x: 60, y: 204, w: 40, h: 16 },   // table by the start
    ],
    levers: [{ x: 128, y: 206, w: 8, h: 14, used: false }],
    sw: { x: 860, y: 204, w: 10, h: 16, on: false },
    door: { x: 888, y: 160, w: 12, h: 60, open: false },
    floor: { t: 0.3, period: 3.0, onFrac: 0.55, zones: [{ x: 160, w: 520 }] },
    carts: [
      { x: 250, y: 196, w: 30, h: 18, vx: 80, minX: 170, maxX: 670 },
      { x: 560, y: 196, w: 30, h: 18, vx: -100, minX: 170, maxX: 670 },
      { x: 740, y: 196, w: 30, h: 18, vx: 110, minX: 700, maxX: 850 },
    ],
  },
];