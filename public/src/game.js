import { W, RUN_TIME } from './config.js';
import { hit } from './input.js';
import { cars } from './level.js';
import { createPlayer, updatePlayer } from './player.js';
import { updateTrain, pullBrake, resetTrain } from './time.js';

// forgot to tell, this file has game states and rules.

const overlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const game = {
  state: 'play', // play lost won
  carIndex: 0,
  timeLeft: RUN_TIME,
  car: null,
  player: null,
  t: 0,
};

export function startRun() {
  resetTrain();
  game.state = 'play';
  game.timeLeft = RUN_TIME;
  loadCar(0);
}

function loadCar(i) {
  game.carIndex = i;
  game.car = structuredClone(cars[i]); // fresh copy so levers and switches reset
  game.player = createPlayer(game.car.spawn.x, game.car.spawn.y);
}

function solidsNow() {
  const c = game.car;
  return c.door.open ? c.solids : [...c.solids, c.door];
}

export function updateGame(dt) {
  game.t += dt;
  if (hit('restart')) { startRun(); return; }
  if (game.state !== 'play') return;

  // The countdown uses REAL dt, so braking costs real seconds.
  game.timeLeft = Math.max(0, game.timeLeft - dt);
  if (game.timeLeft === 0) { game.state = 'lost'; return; }

  updateTrain(dt);
  const c = game.car;
  const p = game.player;
  updatePlayer(p, dt, solidsNow());

  if (hit('interact')) {
    for (const l of c.levers) {
      // One use leverr
      if (!l.used && overlap(p, l) && pullBrake()) l.used = true;
    }
    if (c.sw && !c.sw.on && overlap(p, c.sw)) {
      c.sw.on = true;
      c.door.open = true;
    }
  }

  // walk out through the open door to leave the car
  if (c.door.open && p.x > W - 14) {
    if (game.carIndex + 1 < cars.length) loadCar(game.carIndex + 1);
    else game.state = 'won'; // placeholder rn
  }
}