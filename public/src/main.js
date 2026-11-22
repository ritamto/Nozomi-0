import { endFrame } from './input.js';
import { updateGame, startRun } from './game.js';
import { draw } from './render.js';

const ctx = document.getElementById('game').getContext('2d');
ctx.imageSmoothingEnabled = false;

startRun();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  updateGame(dt);
  draw(ctx, dt);
  endFrame();

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);