import { W, H, RUN_TIME, TRAIN, CAR_BONUS, RANKS } from './config.js';
import { hit } from './input.js';
import { cars } from './level.js';
import { createPlayer, updatePlayer } from './player.js';
import { train, updateTrain, pullBrake, resetTrain, resetSpeed, stopTrain, timeScale } from './time.js';

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
  bonusT: 0,
  carPulls: 0, // pulls banked when the current car started
  result: null,
};

// 'on' = deadly, 'warn' = about to turn on, 'off' = safe
export function floorState(f) {
  const frac = (f.t % f.period) / f.period;
  if (frac < f.onFrac) return 'on';
  return frac > 1 - 0.4 / f.period ? 'warn' : 'off';
}

// laser position at its current phase
export const laserX = l => l.cx + Math.sin(l.t * l.omega) * l.amp;

export function startRun() {
  resetTrain();
  game.state = 'play';
  game.timeLeft = RUN_TIME;
  game.deaths = 0;
  game.flash = 0;
  game.bonusT = 0;
  game.carPulls = 0;
  game.result = null;
  // Was a Debugging line... removed it
    loadCar(0);
}

function loadCar(i) {
  game.carIndex = i;
  game.car = structuredClone(cars[i]); // fresh copy so everything resets
  const c = game.car;
  c.orbs = [];
  c.turrets ??= [];
  c.carts ??= [];
  c.lasers ??= [];
  c.levers ??= [];
  train.target = c.targetSpeed ?? TRAIN.base;
  game.player = createPlayer(c.spawn.x, c.spawn.y);
  game.camX = 0;
}

// Dying resets the car but NOT the countdown
function die() {
  game.deaths++;
  game.flash = 0.3;
  train.pulls = game.carPulls; // pulls from a failed attempt don't count
  resetSpeed();
  loadCar(game.carIndex);
}

function solidsNow() {
  const c = game.car;
  return !c.door || c.door.open ? c.solids : [...c.solids, c.door];
}

function rankRun() {
  const eff = game.timeLeft - game.deaths * 2 - train.pulls;
  const r = RANKS.find(x => eff >= x.min);
  return { time: game.timeLeft, pulls: train.pulls, deaths: game.deaths, rank: r.letter, title: r.title };
}


// Returns true if the player died this frame.
function updateHazards(dt, sdt) {
  const c = game.car;
  const p = game.player;
  const solids = solidsNow();
  const hurt = { x: p.x + 2, y: p.y + 2, w: p.w - 4, h: p.h - 3 }; // forgiving hitbox
  let dead = false;

  // Turrets 
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

  // The AI core
  const core = c.core;
  if (core && !core.overloaded) {
    core.cd -= sdt;
    if (core.cd <= 0) {
      const stage = c.breakers.filter(b => b.on).length;
      const pat = [
        { n: 10, speed: 90, rate: 2.0 },
        { n: 14, speed: 110, rate: 1.6 },
        { n: 18, speed: 130, rate: 1.3 },
      ][stage];
      core.cd += pat.rate;
      core.spin += Math.PI / pat.n; // alternate offsets so the gaps move
      for (let i = 0; i < pat.n; i++) {
        const a = core.spin + (i * 2 * Math.PI) / pat.n;
        c.orbs.push({ x: core.x, y: core.y, vx: Math.cos(a) * pat.speed, vy: Math.sin(a) * pat.speed, r: 3 });
      }
      if (stage >= 1) { // plus one aimed shot
        const a = Math.atan2(p.y + p.h / 2 - core.y, p.x + p.w / 2 - core.x);
        c.orbs.push({ x: core.x, y: core.y, vx: Math.cos(a) * pat.speed * 1.3, vy: Math.sin(a) * pat.speed * 1.3, r: 3 });
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

  // Laser beams
  for (const l of c.lasers) {
    l.t += sdt;
    if (!p.invuln && overlap(hurt, { x: laserX(l) - 1, y: 30, w: 3, h: 190 })) dead = true;
  }

  // Bento carts: land on top to ride them, touch them any other way and you die
  for (const k of c.carts) {
    const dx = k.vx * sdt;
    k.x += dx;
    if (k.x < k.minX) { k.x = k.minX; k.vx = Math.abs(k.vx); }
    if (k.x + k.w > k.maxX) { k.x = k.maxX - k.w; k.vx = -Math.abs(k.vx); }

    const depth = p.y + p.h - k.y;
    const touching = p.x + p.w > k.x + 1 && p.x < k.x + k.w - 1 && p.y < k.y + k.h && depth > 0;
    if (!touching) continue;
    if (p.vy >= 0 && depth <= 5 + p.vy * dt) {
      p.y = k.y - p.h; p.vy = 0; p.grounded = true; p.x += dx;
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
  game.bonusT = Math.max(0, game.bonusT - dt);
  if (hit('restart')) { startRun(); return; }
  if (game.state === 'won') stopTrain(dt);
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
    for (const b of c.breakers ?? []) {
      if (!b.on && overlap(p, b)) { b.on = true; game.flash = 0.12; }
    }
    if (c.core && !c.core.overloaded && c.breakers.every(b => b.on)) {
      c.core.overloaded = true; // the AI is overloaded boom
      c.orbs = [];
      game.flash = 0.4;
    }
    if (c.console && c.core?.overloaded && overlap(p, c.console)) {
      game.result = rankRun();
      game.state = 'won';
      return;
    }
  }

  if (c.door?.open && p.x > c.width - 14) {
    game.timeLeft += CAR_BONUS;
    game.bonusT = 1.5;
    game.carPulls = train.pulls; // bank this car's pulls
    if (game.carIndex + 1 < cars.length) loadCar(game.carIndex + 1);
    else { game.result = rankRun(); game.state = 'won'; }
  }
}