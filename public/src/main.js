import { endFrame } from './input.js';
import { updateGame, } from './game.js';
import { draw } from './render.js';
import { loadArt } from './assets.js';
import { menu, updateMenu, drawMenu } from './menu.js';
import { updateAudio } from './audio.js';

const ctx = document.getElementById('game').getContext('2d');
ctx.imageSmoothingEnabled = false;

await loadArt();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (menu.scene === 'play') {
    updateGame(dt);
    draw(ctx, dt);
    updateAudio(true);
  } else {
    updateMenu(dt);
    drawMenu(ctx);
    updateAudio(false);
  }
  endFrame();

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);