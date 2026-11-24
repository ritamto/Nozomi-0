import { W, H, RUN_TIME } from './config.js';
import { hit } from './input.js';
import { cars } from './level.js';
import { createPlayer, updatePlayer } from './player.js';
import { updateTrain, pullBrake, resetTrain, resetSpeed, timeScale } from './time.js';

const overlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const game = {
  state: 'play', // play lost and wonn
  carIndex: 0,
  timeLeft: RUN_TIME,
  car: null,
  player: null,
  t: 0,
  deaths: 0,
  flash: 0,
};

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
  game.car = structuredClone(cars[i]); // fresh is za best
  game.car.orbs = [];
  game.player = createPlayer(game.car.spawn.x, game.car.spawn.y);
}

// die function, it resets the car but not the countdown.
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

function updateHazards(sdt) {
  const c = game.car;
  const p = game.player;
  const solids = solidsNow();

  for (const t of c.turrets) {
    t.cd -= sdt;
    if (t.cd <= 0) {
      t.cd += t.rate;
      const sx = t.x, sy = t.y + 8;
      const dx = p.x + p.w / 2 - sx;
      const dy = p.y + p.h / 2 - sy;
      const len = Math.hypot(dx, dy) || 1;
      c.orbs.push({ x: sx, y: sy, vx: (dx / len) * t.speed, vy: (dy / len) * t.speed, r: 3 });
    }
  }

  for (const o of c.orbs) {
    o.x += o.vx * sdt;
    o.y += o.vy * sdt;
  }

  const orbRect = o => ({ x: o.x - o.r, y: o.y - o.r, w: o.r * 2, h: o.r * 2 });
  c.orbs = c.orbs.filter(o =>
    o.x > -10 && o.x < W + 10 && o.y > -10 && o.y < H + 10 &&
    !solids.some(s => overlap(orbRect(o), s))
  );

  // slightly forgiving hitbox, gl
  if (!p.invuln) {
    const hurt = { x: p.x + 2, y: p.y + 2, w: p.w - 4, h: p.h - 3 };
    if (c.orbs.some(o => overlap(hurt, orbRect(o)))) {
      die();
      return true;
    }
  }
  return false;
}

export function updateGame(dt) {
  game.t += dt;
  game.flash = Math.max(0, game.flash - dt);
  if (hit('restart')) { startRun(); return; }
  if (game.state !== 'play') return;

  // the countdown uses REA dt,so braking costs real seconds.
  game.timeLeft = Math.max(0, game.timeLeft - dt);
  if (game.timeLeft === 0) { game.state = 'lost'; return; }

  updateTrain(dt);
  const ts = timeScale();
  const c = game.car;
  const p = game.player;
  updatePlayer(p, dt, solidsNow());          // real dt

  if (updateHazards(dt * ts)) return;        // scaled dt

  if (hit('interact')) {
    for (const l of c.levers) {
      if (!l.used && overlap(p, l) && pullBrake()) l.used = true;
    }
    if (c.sw && !c.sw.on && overlap(p, c.sw)) {
      c.sw.on = true;
      c.door.open = true;
    }
  }

  if (c.door.open && p.x > W - 14) {
    if (game.carIndex + 1 < cars.length) loadCar(game.carIndex + 1);
    else game.state = 'won'; // once a placeholder always a placewholder.
  }
}