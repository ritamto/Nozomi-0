import { W, H } from './config.js';
// real cars gng
export const cars = [
  {
    name: 'CAR 1 : PASSENGER CABIN',
    spawn: { x: 24, y: 200 },
    solids: [
      { x: 0, y: 220, w: W, h: 50 },       // floor
      { x: 0, y: 0, w: W, h: 30 },         // ceiling
      { x: 0, y: 0, w: 8, h: H },          // left wall
      { x: W - 12, y: 0, w: 12, h: 160 },  // right wall doors aboev
      { x: 90, y: 200, w: 44, h: 20 },     // seat bench
      { x: 340, y: 200, w: 44, h: 20 },    // seat bench
    ],
    levers: [{ x: 236, y: 206, w: 8, h: 14, used: false }],
    sw: { x: 430, y: 204, w: 10, h: 16, on: false },
    door: { x: W - 12, y: 160, w: 12, h: 60, open: false },
    turrets: [
      { x: 120, y: 30, cd: 1.0, rate: 1.5, speed: 100 },
      { x: 360, y: 30, cd: 1.8, rate: 1.5, speed: 100 },
    ], //here it is.
  },
];