import { W, H, COLORS } from './config.js'; // yea the file i made jus now. lets code the other part now.
import { makeSprite } from './sprite.js'; // i made it just now.

const ctx = document.getElementById('game').getContext('2d');
ctx.imageSmoothingEnabled = false;

// top half of the courier sprite, which is fanstatic. the legs are animated separately.
const top = [
  '...dddd...',
  '..dccccd..',
  '..cwwwwc..',
  '..cwkkwc..',
  '..dccccd..',
  '.dccccccd.',
  '.cccwwccc.',
  '.cccccccc.',
  '.dcccccd..',
];
const legs = {
  idle: ['..cc..cc..', '..cc..cc..', '..dd..dd..', '..kk..kk..'],
  runA: ['..cc..cc..', '.cc....cc.', '.dd....dd.', '.kk....kk.'],
  runB: ['...cccc...', '...cddc...', '...dkkd...', '...kkkk...'],
};
const frames = [legs.runA, legs.idle, legs.runB, legs.idle].map(l => makeSprite([...top, ...l]));

// Speed lines outside the window
const lines = Array.from({ length: 24 }, () => ({
  x: Math.random() * W,
  y: 40 + Math.random() * 70,
  len: 10 + Math.random() * 40,
  speed: 200 + Math.random() * 300,
}));

let last = performance.now();
let t = 0;

function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  t += dt;

  // Nighty nite
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Windows XP
  ctx.fillStyle = COLORS.bgLight;
  ctx.fillRect(60, 30, 360, 90);
  ctx.fillStyle = COLORS.line;
  for (const l of lines) {
    l.x -= l.speed * dt;
    if (l.x + l.len < 60) { l.x = 420; l.y = 36 + Math.random() * 78; }
    const x0 = Math.max(60, Math.round(l.x));
    const x1 = Math.min(420, Math.round(l.x + l.len));
    if (x1 > x0) ctx.fillRect(x0, Math.round(l.y), x1 - x0, 1);
  }

  // Window frame and wall
  ctx.fillStyle = COLORS.train;
  ctx.fillRect(0, 0, W, 30);
  ctx.fillRect(0, 120, W, 100);
  ctx.fillRect(0, 30, 60, 90);
  ctx.fillRect(420, 30, 60, 90);
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(60, 29, 360, 1);
  ctx.fillRect(60, 120, 360, 1);

  // floor
  ctx.fillStyle = COLORS.trainLight;
  ctx.fillRect(0, 220, W, 50);
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(0, 220, W, 1);

  // Courier running back and forth. 
  const x = 240 + Math.sin(t * 1.5) * 120;
  const dir = Math.cos(t * 1.5) >= 0 ? 1 : -1;
  const sprite = frames[Math.floor(t * 10) % frames.length];
  ctx.save();
  ctx.translate(Math.round(x), 220 - sprite.height);
  if (dir < 0) { ctx.translate(sprite.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(sprite, 0, 0);
  ctx.restore();

  ctx.fillStyle = COLORS.line;
  ctx.font = '8px monospace';
  ctx.fillText('NOZOMI-0 : pixel renderer online', 8, 14);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);