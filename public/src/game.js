import { W, H, RUN_TIME } from './config.js';
import { hit } from './input.js';
import { cars } from './level.js';
import { createPlayer, updatePlayer } from './player.js';
import { updateTrain, pullBrake, resetTrain, resetSpeed, timeScale } from './time.js';

const overlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const game = {
  state: 'play', // 'play' | 'lost' | 'won'
  carIndex: 0,
  timeLeft: RUN_TIME,
  car: null,
  player: null,
  t: 0,
  deaths: 0,
  flash: 0,
  camX: 0,
};

// 'on' = deadly, 'warn' = about to turn on, 'off' = safe
export function floorState(f) {
  const frac = (f.t % f.period) / f.period;
  if (frac < f.onFrac) return 'on';
  return frac > 1 - 0.4 / f.period ? 'warn' : 'off';
}

export function startRun() {
  resetTrain();
  game.state = 'play';
  game.timeLeft = RUN_TIME;
  game.deaths = 0;
  game.flash = 0;
  loadCar(0);
}

function loadCar(i) {
  game.carIndex = i;
  game.car = structuredClone(cars[i]); // fresh copy so everything resets
  game.car.orbs = [];
  game.car.turrets ??= [];
  game.car.carts ??= [];
  game.player = createPlayer(game.car.spawn.x, game.car.spawn.y);
  game.camX = 0;
}

// Dying resets the car but NOT the countdown, so every death costs real time.
function die() {
  game.deaths++;
  game.flash = 0.3;
  resetSpeed();
  loadCar(game.carIndex);
}

function solidsNow() {
  const c = game.car;
  return c.door.open ? c.solids : [...c.solids, c.door];
}

// sdt = dt * time_scale. Turrets, orbs, carts and the floor live on scaled time.
// Returns true if the player died this frame.
function updateHazards(dt, sdt) {
  const c = game.car;
  const p = game.player;
  const solids = solidsNow();
  const hurt = { x: p.x + 2, y: p.y + 2, w: p.w - 4, h: p.h - 3 }; // forgiving hitbox
  let dead = false;

  // Turrets (lead their shots)
  for (const t of c.turrets) {
    if (Math.abs(t.x - (p.x + p.w / 2)) > 280) continue; // only fire when near the player
    t.cd -= sdt;
    if (t.cd <= 0) {
      t.cd += t.rate;
      const sx = t.x, sy = t.y + 8;
      const dist = Math.hypot(p.x - sx, p.y - sy);
      const lead = (dist / t.speed) * (t.lead ?? 0.8);
      const tx = p.x + p.w / 2 + p.vx * lead;
      const ty = p.y + p.h / 2;
      const base = Math.atan2(ty - sy, tx - sx);
      const n = t.spread ?? 1;
      for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) / 2) * 0.28;
        c.orbs.push({ x: sx, y: sy, vx: Math.cos(a) * t.speed, vy: Math.sin(a) * t.speed, r: 3 });
      }
    }
  }

  // Orbs
  for (const o of c.orbs) {
    o.x += o.vx * sdt;
    o.y += o.vy * sdt;
  }
  const orbRect = o => ({ x: o.x - o.r, y: o.y - o.r, w: o.r * 2, h: o.r * 2 });
  c.orbs = c.orbs.filter(o =>
    o.x > -10 && o.x < c.width + 10 && o.y > -10 && o.y < H + 10 &&
    !solids.some(s => overlap(orbRect(o), s))
  );
  if (!p.invuln && c.orbs.some(o => overlap(hurt, orbRect(o)))) dead = true;

  // Electrified floor
  if (c.floor) {
    c.floor.t += sdt;
    if (!p.invuln && floorState(c.floor) === 'on') {
      for (const z of c.floor.zones) {
        if (overlap(hurt, { x: z.x, y: 214, w: z.w, h: 6 })) dead = true;
      }
    }
  }

  // Bento carts: land on top to ride them, touch them any other way and you die
  for (const k of c.carts) {
    const dx = k.vx * sdt;
    k.x += dx;
    if (k.x < k.minX) { k.x = k.minX; k.vx = Math.abs(k.vx); }
    if (k.x + k.w > k.maxX) { k.x = k.maxX - k.w; k.vx = -Math.abs(k.vx); }

    const depth = p.y + p.h - k.y; // how far the feet are below the cart's top
    const touching = p.x + p.w > k.x + 1 && p.x < k.x + k.w - 1 && p.y < k.y + k.h && depth > 0;
    if (!touching) continue;
    if (p.vy >= 0 && depth <= 5 + p.vy * dt) {
      p.y = k.y - p.h; p.vy = 0; p.grounded = true; p.x += dx; // riding
    } else if (p.vy < 0 && depth <= 9) {
      // just jumped off the top: ignore
    } else if (!p.invuln && overlap(hurt, k)) {
      dead = true;
    }
  }

  if (dead) { die(); return true; }
  return false;
}

export function updateGame(dt) {
  game.t += dt;
  game.flash = Math.max(0, game.flash - dt);
  if (hit('restart')) { startRun(); return; }
  if (game.state !== 'play') return;

  // The countdown uses REAL dt, so braking costs real seconds.
  game.timeLeft = Math.max(0, game.timeLeft - dt);
  if (game.timeLeft === 0) { game.state = 'lost'; return; }

  updateTrain(dt);
  const ts = timeScale();
  const c = game.car;
  const p = game.player;
  updatePlayer(p, dt, solidsNow());          // real dt
  game.camX = Math.max(0, Math.min(c.width - W, p.x + p.w / 2 - W / 2));

  if (updateHazards(dt, dt * ts)) return;    // scaled dt

  if (hit('interact')) {
    for (const l of c.levers) {
      if (!l.used && overlap(p, l) && pullBrake()) l.used = true;
    }
    if (c.sw && !c.sw.on && overlap(p, c.sw)) {
      c.sw.on = true;
      c.door.open = true;
    }
  }

  if (c.door.open && p.x > c.width - 14) {
    if (game.carIndex + 1 < cars.length) loadCar(game.carIndex + 1);
    else game.state = 'won'; // placeholder until more cars exist
  }
}