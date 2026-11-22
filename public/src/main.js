import { W, H, COLORS } from './config.js'; // yea the file i made jus now. lets code the other part now.


const ctx = document.getElementById('game').getContext('2d');

let last = performance.now();
let t = 0;

function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  t += dt;


  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = COLORS.player;
  ctx.fillRect(100 + Math.sin(t * 2) * 60, 250, 22, 34);

  ctx.fillStyle = COLORS.line;
  ctx.font = '20px monospace';
  ctx.fillText('NOZOMI-0 : engine online', 30, 40);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame); // done coding in ts.