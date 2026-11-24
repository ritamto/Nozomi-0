// will add all the cool drawing stuff here.
import { W, H, COLORS, TRAIN } from './config.js';
import { train, timeScale, braking } from './time.js';
import { courier, orb, turret } from './sprites.js';
import { game } from './game.js';

const overlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const lines = Array.from({ length: 24 }, () => ({
  x: Math.random() * W,
  y: 36 + Math.random() * 78,
  len: 10 + Math.random() * 40,
  speed: 200 + Math.random() * 300,
}));

export function draw(ctx, dt) {
  const ts = timeScale();
  drawBackground(ctx, ts, dt);
  drawSolids(ctx, game.car);
  drawProps(ctx, game.car, game.player);
  drawHazards(ctx, game.car);
  drawPlayer(ctx, game.player);
  drawHud(ctx, game.car);
  if (game.flash > 0) {
    ctx.fillStyle = `rgba(255,42,85,${game.flash})`;
    ctx.fillRect(0, 0, W, H);
  }
  drawOverlay(ctx);
} // added hazard, its in the file below calls and red FLASJ

function drawHazards(ctx, car) {
  for (const t of car.turrets) {
    ctx.drawImage(turret, Math.round(t.x - 6), t.y);
    if (t.cd < 0.35) {
      ctx.fillStyle = COLORS.line;
      ctx.fillRect(Math.round(t.x - 1), t.y + 4, 2, 2);
    }
  }
  for (const o of car.orbs) ctx.drawImage(orb, Math.round(o.x - 3), Math.round(o.y - 3));
}

function drawBackground(ctx, ts, dt) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // wall behind everything
  ctx.fillStyle = COLORS.train;
  ctx.fillRect(0, 0, W, 220);

  // window with speed lines (scaled by time_scale)
  ctx.fillStyle = braking() ? '#0b1a2e' : COLORS.bgLight;
  ctx.fillRect(60, 40, 360, 80);
  ctx.fillStyle = COLORS.line;
  for (const l of lines) {
    l.x -= l.speed * dt * ts;
    if (l.x + l.len < 60) { l.x = 420; l.y = 44 + Math.random() * 72; }
    const x0 = Math.max(60, Math.round(l.x));
    const x1 = Math.min(420, Math.round(l.x + l.len));
    if (x1 > x0) ctx.fillRect(x0, Math.round(l.y), x1 - x0, 1);
  }
  ctx.fillRect(60, 39, 360, 1);
  ctx.fillRect(60, 120, 360, 1);
}

function drawSolids(ctx, car) {
  ctx.fillStyle = COLORS.trainLight;
  for (const s of car.solids) ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = COLORS.line;
  for (const s of car.solids) if (s.y > 0) ctx.fillRect(s.x, s.y, s.w, 1);
}

function drawProps(ctx, car, p) {
  // Brake levers
  for (const l of car.levers) {
    ctx.fillStyle = COLORS.playerDark;
    ctx.fillRect(l.x, l.y + 8, l.w, 6);
    ctx.fillStyle = l.used ? COLORS.playerDark : COLORS.player;
    if (l.used) {
      ctx.fillRect(l.x + 3, l.y + 8, 5, 2);          // lever pushed down
    } else {
      ctx.fillRect(l.x + 3, l.y + 1, 2, 8);          // pole
      ctx.fillRect(l.x + 2, l.y, 4, 3);              // knob
      if (overlap(p, l)) prompt(ctx, l.x + 4, l.y - 6);
    }
  }

  // dooor switch
  const sw = car.sw;
  if (sw) {
    ctx.fillStyle = COLORS.train;
    ctx.fillRect(sw.x, sw.y, sw.w, sw.h);
    ctx.fillStyle = sw.on ? COLORS.player : COLORS.hazard;
    ctx.fillRect(sw.x + 2, sw.y + 3, sw.w - 4, 5);
    ctx.fillStyle = COLORS.line;
    ctx.fillRect(sw.x, sw.y, sw.w, 1);
    if (!sw.on && overlap(p, sw)) prompt(ctx, sw.x + 5, sw.y - 6);
  }

  // blast door

  const d = car.door;
  if (!d.open) {
    ctx.fillStyle = COLORS.hazardDark;
    ctx.fillRect(d.x, d.y, d.w, d.h);
    ctx.fillStyle = COLORS.hazard;
    for (let y = d.y + 4; y < d.y + d.h; y += 8) ctx.fillRect(d.x + 2, y, d.w - 4, 2);
  }
}

function prompt(ctx, x, y) {
  ctx.fillStyle = COLORS.line;
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('E', x, y);
  ctx.textAlign = 'left';
}

function drawPlayer(ctx, p) {
  let sprite = courier.idle;
  if (!p.grounded) sprite = courier.jump;
  else if (Math.abs(p.vx) > 10) sprite = courier.run[Math.floor(game.t * 12) % 4];

  ctx.save();
  ctx.globalAlpha = p.invuln ? 0.45 : 1;
  ctx.translate(Math.round(p.x), Math.round(p.y));
  if (p.face < 0) { ctx.translate(sprite.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(sprite, 0, 0);
  ctx.restore();
}

function drawHud(ctx, car) {
  ctx.fillStyle = COLORS.line;
  ctx.font = '8px monospace';
  ctx.fillText(car.name, 12, 14);
  ctx.fillText(`${train.speed.toFixed(0)} km/h  x${timeScale().toFixed(2)}`, 12, 24);
  ctx.fillText(`deaths ${game.deaths}`, 12, 34);
  // Arrival countdown
  ctx.font = '16px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = game.timeLeft < 10 ? COLORS.hazard : COLORS.line;
  ctx.fillText(game.timeLeft.toFixed(2), W - 12, 20);
  ctx.textAlign = 'left';


  // Brake ba r
  if (braking()) {
    const w = 80 * (train.brakeLeft / TRAIN.brakeDuration);
    ctx.fillStyle = COLORS.playerDark;
    ctx.fillRect(W / 2 - 40, 8, 80, 4);
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(W / 2 - 40, 8, w, 4);
  }
}

function drawOverlay(ctx) {
  if (game.state === 'play') return;
  ctx.fillStyle = 'rgba(13,17,23,0.8)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.font = '20px monospace';
  ctx.fillStyle = game.state === 'lost' ? COLORS.hazard : COLORS.player;
  ctx.fillText(game.state === 'lost' ? 'TIME UP' : 'ARRIVED (somewhere ig)', W / 2, 120);
  ctx.font = '10px monospace';
  ctx.fillStyle = COLORS.line;
  ctx.fillText('press R to restart', W / 2, 145);
  ctx.textAlign = 'left';
}