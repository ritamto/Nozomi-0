import { endFrame } from './input.js';
import { updateGame, startRun } from './game.js';
import { draw } from './render.js';
import { loadArt } from './assets.js';
import { menu, updateMenu, drawMenu } from './menu.js';
import { updateAudio } from './audio.js';

const ctx = document.getElementById('game').getContext('2d');
ctx.imageSmoothingEnabled = false;

await loadArt();

// /?car=N for debug stuff, like skipping
if (new URLSearchParams(location.search).has('car')) {
  menu.scene = 'play';
  startRun();
}

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