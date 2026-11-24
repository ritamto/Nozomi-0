// will add all the cool drawing stuff here.
import { W, H, COLORS, TRAIN, PLAYER, CAR_BONUS } from './config.js';
import { train, timeScale, braking } from './time.js';
import { courier, orb, turret, core as coreSprite } from './sprites.js';
import { art } from './assets.js';
import { game, floorState, laserX } from './game.js';

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

  // World space:=) shifted by the camera
  ctx.save();
  ctx.translate(-Math.round(game.camX), 0);
  drawSeams(ctx, game.car);
  drawSolids(ctx, game.car);
  drawProps(ctx, game.car, game.player);
  drawEngine(ctx, game.car, game.player);
  drawHazards(ctx, game.car);
  drawPlayer(ctx, game.player);
  ctx.restore();

  // Screen space :=) HUD and effects
  drawHud(ctx, game.car);
  if (game.flash > 0) {
    ctx.fillStyle = `rgba(255,42,85,${game.flash})`;
    ctx.fillRect(0, 0, W, H);
  }
  drawOverlay(ctx);
}
 // added hazard, its in the file below calls and red FLASJ

function drawHazards(ctx, car) {
  drawFloor(ctx, car);
  for (const t of car.turrets) {
    ctx.drawImage(turret, Math.round(t.x - 6), t.y);
    if (t.cd < 0.35) {
      ctx.fillStyle = COLORS.line;
      ctx.fillRect(Math.round(t.x - 1), t.y + 4, 2, 2);
    }
  }
  for (const o of car.orbs) ctx.drawImage(orb, Math.round(o.x - 3), Math.round(o.y - 3));
  
  drawCarts(ctx, car);
  drawLasers(ctx, car); //lasers, function is just belouw
}

function drawLasers(ctx, car) {
  for (const l of car.lasers) {
    const x = Math.round(laserX(l));
    ctx.fillStyle = 'rgba(255,42,85,0.25)';
    ctx.fillRect(x - 3, 31, 7, 189);          // glow
    ctx.fillStyle = COLORS.hazard;
    ctx.fillRect(x - 1, 31, 3, 189);          // beam
    ctx.fillStyle = COLORS.line;
    ctx.fillRect(x, 31, 1, 189);              // hot core
    ctx.fillStyle = COLORS.hazardDark;        // emitters
    ctx.fillRect(x - 4, 30, 9, 3);
    ctx.fillRect(x - 4, 213, 9, 3);
  }
}



function drawFloor(ctx, car) {
  const f = car.floor;
  if (!f) return;
  const s = floorState(f);
  const blink = Math.floor(game.t * 14) % 2 === 0;
  for (const z of f.zones) {
    ctx.fillStyle = s === 'on' || (s === 'warn' && blink) ? COLORS.hazard : COLORS.hazardDark;
    ctx.fillRect(z.x, 216, z.w, 4);
    ctx.fillStyle = COLORS.line;
    ctx.fillRect(z.x, 215, 1, 5);
    ctx.fillRect(z.x + z.w - 1, 215, 1, 5);
    if (s === 'on') {
      for (let x = z.x + 3; x < z.x + z.w; x += 9) {
        ctx.fillRect(x, 211 + ((x + Math.floor(game.t * 20)) % 4), 1, 2); // sparks
      }
    }
  }
}

function drawCarts(ctx, car) {
  for (const k of car.carts) {
    const x = Math.round(k.x), y = k.y;
    ctx.fillStyle = COLORS.hazardDark;
    ctx.fillRect(x, y + 4, k.w, k.h - 4);
    ctx.fillStyle = COLORS.hazard;
    ctx.fillRect(x, y, k.w, 4);
    ctx.fillStyle = COLORS.line;
    ctx.fillRect(x, y, k.w, 1);               // lid highlight
    ctx.fillRect(x + 3, y + 9, k.w - 6, 1);   // label strip
    ctx.fillRect(x + 4, y + k.h, 3, 2);       // thrusters
    ctx.fillRect(x + k.w - 7, y + k.h, 3, 2);
  }
}

// pillars between windows to see car crossing by
function drawSeams(ctx, car) {
    const th = game.car.theme;
  ctx.globalAlpha = th.trim ? 0.4 : 1;
  ctx.fillStyle = th.trim ?? COLORS.trainLight;
  for (let x = 80; x < car.width; x += 80) ctx.fillRect(x, 30, 2, 190);
  ctx.globalAlpha = 1;
}
let sceneryX = 0;

// tiles an image with every other copy mirrored, so the seams are invisible.
function tileMirrored(ctx, img, y, from, to, offset) {
  const w = img.width;
  for (let k = Math.floor((from + offset) / w); k * w - offset < to; k++) {
    const dx = Math.round(k * w - offset);
    if (k & 1) {
      ctx.save();
      ctx.translate(dx + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(img, dx, y);
    }
  }
}

function drawBackground(ctx, ts, dt) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

    // Interior wall each car has its own theme
  const th = game.car.theme;
  ctx.fillStyle = th.base;
  ctx.fillRect(0, 0, W, 220);
  const wall = art[th.wall];
  if (wall) {
    tileMirrored(ctx, wall, 0, 0, W, Math.round(game.camX));
    ctx.fillStyle = th.tint;
    ctx.fillRect(0, 0, W, 220);
  }
  if (th.trim) {
    ctx.fillStyle = th.trim;
    ctx.fillRect(0, 31, W, 1);   // ceiling stripe
    ctx.fillRect(0, 34, W, 1);
    ctx.fillRect(0, 213, W, 1);  // baseboard line
  }

  // Window scenery
  sceneryX += 120 * dt * ts;
  ctx.save();
  ctx.beginPath();
  ctx.rect(60, 40, 360, 80);
  ctx.clip();
  const scene = art[th.scene ?? 'scenery'] ?? art.scenery;
  if (scene) {
        tileMirrored(ctx, scene, 0, 60, 420, sceneryX);
    ctx.fillStyle = braking() ? 'rgba(0,80,170,0.38)' : 'rgba(13,17,23,0.2)';
    ctx.fillRect(60, 40, 360, 80);
  } else {
    ctx.fillStyle = braking() ? '#0b1a2e' : COLORS.bgLight;
    ctx.fillRect(60, 40, 360, 80);
  }

  // Speed streaks on top of the pic (scenery)
  ctx.fillStyle = COLORS.line;
  for (const l of lines) {
    l.x -= l.speed * dt * ts;
    if (l.x + l.len < 60) { l.x = 420; l.y = 44 + Math.random() * 72; }
    const x0 = Math.max(60, Math.round(l.x));
    const x1 = Math.min(420, Math.round(l.x + l.len));
    if (x1 > x0) ctx.fillRect(x0, Math.round(l.y), x1 - x0, 1);
  }
  ctx.restore();

  ctx.fillStyle = th.trim ?? COLORS.line;
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
  if (d && !d.open) {
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
  ctx.globalAlpha = 1;
  ctx.translate(Math.round(p.x), Math.round(p.y));
  if (p.face < 0) { ctx.translate(sprite.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(sprite, 0, 0);
  ctx.restore();
    if (p.invuln) {
    const flicker = p.shieldT < 0.08 && Math.floor(game.t * 30) % 2 === 0;
    if (!flicker) {
      ctx.strokeStyle = COLORS.player;
      ctx.fillStyle = 'rgba(0,240,255,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(Math.round(p.x + p.w / 2), Math.round(p.y + p.h / 2), 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
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
  const dashReady = 1 - game.player.dashCd / PLAYER.dashCooldown;
  ctx.fillStyle = COLORS.playerDark;
  ctx.fillRect(12, 38, 30, 3);
  ctx.fillStyle = dashReady >= 1 ? COLORS.player : COLORS.line;
  ctx.fillRect(12, 38, Math.round(30 * dashReady), 3);

    if (car.breakers) {
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.line;
    const n = car.breakers.filter(b => b.on).length;
    ctx.fillText(car.core?.overloaded ? 'CORE OVERLOADED: REACH THE CONSOLE' : `BREAKERS ${n}/3`, W / 2, 26);
    ctx.textAlign = 'left';
  }
  if (game.bonusT > 0) {
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.player;
    ctx.fillText(`+${CAR_BONUS}s`, W - 12, 32);
    ctx.textAlign = 'left';
  }
}

function drawOverlay(ctx) {
  if (game.state === 'play') return;
  ctx.fillStyle = 'rgba(13,17,23,0.8)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  if (game.state === 'lost') {
    ctx.font = '20px monospace';
    ctx.fillStyle = COLORS.hazard;
    ctx.fillText('TIME UP', W / 2, 120);
    ctx.font = '10px monospace';
    ctx.fillStyle = COLORS.line;
    ctx.fillText('the train reached Tokyo without you', W / 2, 140);
    ctx.fillText('press R to restart', W / 2, 158);
  } else {
    drawTicket(ctx);
  }
  ctx.textAlign = 'left';
}

function drawTicket(ctx) {
  const r = game.result;
  const x = 90, y = 46, w = 300, h = 178;
  ctx.fillStyle = '#E6EDF3';                       // ticket paper
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COLORS.hazard;
  ctx.fillRect(x, y, w, 22);
  ctx.fillStyle = COLORS.bg;                       // side notches
  ctx.fillRect(x - 4, y + 108, 8, 8);
  ctx.fillRect(x + w - 4, y + 108, 8, 8);

  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.line;
  ctx.font = '12px monospace';
  ctx.fillText('TOKYO STATION', W / 2, y + 15);
  ctx.fillStyle = COLORS.bg;
  ctx.font = '8px monospace';
  ctx.fillText('NOZOMI-0 / ARRIVAL TICKET', W / 2, y + 36);

  const rows = [
    ['TIME LEFT', `${r.time.toFixed(2)}s`],
    ['BRAKES PULLED', `${r.pulls}`],
    ['DEATHS', `${r.deaths}`],
  ];
  ctx.font = '10px monospace';
  rows.forEach(([label, value], i) => {
    const ly = y + 62 + i * 20;
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 20, ly);
    ctx.textAlign = 'right';
    ctx.fillText(value, x + 170, ly);
  });

  ctx.textAlign = 'center';                        // rank
  ctx.fillStyle = COLORS.hazard;
  ctx.font = '48px monospace';
  ctx.fillText(r.rank, x + 235, y + 88);
  ctx.fillStyle = COLORS.bg;
  ctx.font = '8px monospace';
  ctx.fillText(`${r.rank}-RANK`, x + 235, y + 104);

  ctx.fillStyle = COLORS.trainLight;               // perforation
  for (let px = x + 10; px < x + w - 10; px += 6) ctx.fillRect(px, y + 112, 3, 1);

  ctx.fillStyle = COLORS.bg;
  ctx.font = '10px monospace';
  ctx.fillText(r.title, W / 2, y + 138);
  ctx.font = '8px monospace';
  ctx.fillText('press R to ride again', W / 2, y + 160);
}

function drawEngine(ctx, car, p) {
  const core = car.core;
  if (core) {
    const cx = Math.round(core.x), cy = Math.round(core.y);
    if (!core.overloaded && core.cd < 0.4) {       // charging flash before each burst
      ctx.fillStyle = 'rgba(255,42,85,0.35)';
      ctx.fillRect(cx - 12, cy - 12, 24, 24);
    }
    if (core.overloaded && Math.floor(game.t * 12) % 2) ctx.globalAlpha = 0.5;
    ctx.drawImage(coreSprite, cx - 6, cy - 5);
    ctx.globalAlpha = 1;
    if (core.overloaded) {                          // sparks
      ctx.fillStyle = COLORS.line;
      const f = Math.floor(game.t * 20);
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(cx - 10 + ((i * 37 + f * 13) % 20), cy - 8 + ((i * 23 + f * 7) % 16), 1, 1);
      }
    }
  }

  for (const b of car.breakers ?? []) {
    ctx.fillStyle = COLORS.train;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = COLORS.line;
    ctx.fillRect(b.x, b.y, b.w, 1);
    ctx.fillStyle = b.on ? COLORS.player : COLORS.hazard;
    ctx.fillRect(b.x + 2, b.on ? b.y + 9 : b.y + 3, b.w - 4, 4); // switch position
    ctx.fillRect(b.x + 3, b.y - 3, 4, 2);                        // lamp
    if (!b.on && overlap(p, b)) prompt(ctx, b.x + 5, b.y - 7);
  }

  const k = car.console;
  if (k) {
    const ready = car.core?.overloaded;
    const blink = Math.floor(game.t * 6) % 2 === 0;
    ctx.fillStyle = COLORS.train;
    ctx.fillRect(k.x, k.y, k.w, k.h);
    ctx.fillStyle = COLORS.line;
    ctx.fillRect(k.x, k.y, k.w, 1);
    ctx.fillStyle = ready ? (blink ? COLORS.player : COLORS.playerDark) : COLORS.hazardDark;
    ctx.fillRect(k.x + 3, k.y + 4, k.w - 6, 8);                  // screen
    ctx.fillStyle = ready ? COLORS.player : COLORS.hazard;
    ctx.fillRect(k.x + k.w / 2 - 3, k.y + 14, 6, 4);             // master brake button
    if (overlap(p, k)) {
      if (ready) prompt(ctx, k.x + k.w / 2, k.y - 4);
      else {
        ctx.fillStyle = COLORS.hazard;
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LOCKED', k.x + k.w / 2, k.y - 4);
        ctx.textAlign = 'left';
      }
    }
  }
}

// for the engine