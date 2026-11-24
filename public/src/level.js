import { W, H } from './config.js'; //guess i need w too

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
    theme: { wall: 'dining', base: '#2A1018', tint: 'rgba(32,6,18,0.72)', trim: '#C9A227' },
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

    {
    name: 'CAR 3 : CARGO HOLD',
    width: 1060,
    theme: { wall: 'interior', scene: 'night', base: '#1B2028', tint: 'rgba(8,12,20,0.7)', trim: '#6E7681' },
    spawn: { x: 24, y: 200 },
    solids: [
      { x: 0, y: 220, w: 1060, h: 50 },
      { x: 0, y: 0, w: 1060, h: 30 },
      { x: 0, y: 0, w: 8, h: H },
      { x: 1048, y: 0, w: 12, h: 160 },
      { x: 70, y: 190, w: 30, h: 30 },    // crate stack by the start
    ],
      levers: [
      { x: 210, y: 206, w: 8, h: 14, used: false },   // before field A
      { x: 560, y: 206, w: 8, h: 14, used: false },   // before field B
    ],
    sw: { x: 1020, y: 204, w: 10, h: 16, on: false },
    door: { x: 1048, y: 160, w: 12, h: 60, open: false },
    lasers: [
      // Field a  slower, wide sweeps
      { cx: 300, amp: 25, omega: 1.6, t: 0 },
      { cx: 390, amp: 25, omega: 1.6, t: 2.0 },
      { cx: 480, amp: 25, omega: 1.6, t: 3.9 },
      // Field b faster and furiouser, denser too
      { cx: 640, amp: 30, omega: 2.2, t: 0 },
      { cx: 725, amp: 30, omega: 2.2, t: 1.4 },
      { cx: 810, amp: 30, omega: 2.2, t: 2.9 },
      { cx: 895, amp: 30, omega: 2.2, t: 4.3 },
    ],
  },

    {
    name: 'CAR 4 : ENGINE ROOM',
    width: W,
    theme: { wall: null, scene: 'dawn', base: '#1A1216', tint: 'rgba(26,8,14,0.7)', trim: '#8A1230' },
    targetSpeed: 400,
    spawn: { x: 24, y: 200 },
    solids: [
      { x: 0, y: 220, w: W, h: 50 },
      { x: 0, y: 0, w: W, h: 30 },
      { x: 0, y: 0, w: 8, h: H },
      { x: W - 8, y: 0, w: 8, h: H },
      { x: 56, y: 172, w: 70, h: 6 },    // left platform
      { x: 354, y: 172, w: 70, h: 6 },   // right platform
    ],
    levers: [{ x: 40, y: 206, w: 8, h: 14, used: false }],
    core: { x: 240, y: 72, cd: 1.5, spin: 0, overloaded: false },
    breakers: [
      { x: 235, y: 204, w: 10, h: 16, on: false },   // floor, under the core
      { x: 80, y: 156, w: 10, h: 16, on: false },    // left platform
      { x: 380, y: 156, w: 10, h: 16, on: false },   // right platform
    ],
    console: { x: 440, y: 198, w: 24, h: 22 },       // master brake
  },

];