import { W, H, COLORS } from './config.js'; // yea the file i made jus now. lets code the other part now.
import { endFrame, hit } from './input.js';
import { train, updateTrain, timeScale, pullBrake, braking } from './time.js';
import { createPlayer, updatePlayer } from './player.js';
import { courier } from './sprites.js';


const ctx = document.getElementById('game').getContext('2d');
ctx.imageSmoothingEnabled = false;

// Temporary test room  reel cars, real later.
const solids = [
  { x: 0, y: 220, w: W, h: 50 },   // floor
  { x: 0, y: 0, w: 8, h: H },      // left wall
  { x: W - 8, y: 0, w: 8, h: H },  // right wall
  { x: 150, y: 175, w: 60, h: 6 }, // platform
  { x: 270, y: 140, w: 60, h: 6 }, // platform
];

const player = createPlayer(40, 200);

const lines = Array.from({ length: 24 }, () => ({
  x: Math.random() * W,
  y: 40 + Math.random() * 70,
  len: 10 + Math.random() * 40,
  speed: 200 + Math.random() * 300,
}));

let last = performance.now();
let t = 0;

function update(dt) {
  t += dt;
  if (hit('interact')) pullBrake();
  updateTrain(dt);
  updatePlayer(player, dt, solids); // real dt
}

function drawWorld(ts, dt) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Window xp + speed lines (scaled by time_scale)
  ctx.fillStyle = braking() ? '#0b1a2e' : COLORS.bgLight;
  ctx.fillRect(60, 30, 360, 90);
  ctx.fillStyle = COLORS.line;
  for (const l of lines) {
    l.x -= l.speed * dt * ts;
    if (l.x + l.len < 60) { l.x = 420; l.y = 36 + Math.random() * 78; }
    const x0 = Math.max(60, Math.round(l.x));
    const x1 = Math.min(420, Math.round(l.x + l.len));
    if (x1 > x0) ctx.fillRect(x0, Math.round(l.y), x1 - x0, 1);
  }

  // Walls and window frame
  ctx.fillStyle = COLORS.train;
  ctx.fillRect(0, 0, W, 30);
  ctx.fillRect(0, 120, W, 100);
  ctx.fillRect(0, 30, 60, 90);
  ctx.fillRect(420, 30, 60, 90);
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(60, 29, 360, 1);
  ctx.fillRect(60, 120, 360, 1);

  // floor, side walls, platforms
  ctx.fillStyle = COLORS.trainLight;
  for (const s of solids) ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = COLORS.line;
  for (const s of solids) ctx.fillRect(s.x, s.y, s.w, 1);
}

function drawPlayer() {
  let sprite = courier.idle;
  if (!player.grounded) sprite = courier.jump;
  else if (Math.abs(player.vx) > 10) sprite = courier.run[Math.floor(t * 12) % 4];

  ctx.save();
  ctx.globalAlpha = player.invuln ? 0.45 : 1;
  ctx.translate(Math.round(player.x), Math.round(player.y));
  if (player.face < 0) { ctx.translate(sprite.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(sprite, 0, 0);
  ctx.restore();
}

function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  update(dt);
  drawWorld(timeScale(), dt);
  drawPlayer();

  ctx.fillStyle = COLORS.line;
  ctx.font = '8px monospace';
  ctx.fillText(`${train.speed.toFixed(0)} km/h   x${timeScale().toFixed(2)}   [E] brake`, 8, 14);

  endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
