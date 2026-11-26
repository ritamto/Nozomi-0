import { W, H, COLORS } from './config.js';
import { courier, orb, core } from './sprites.js';
import { art } from './assets.js';
import { startRun } from './game.js';
import { endFrame } from './input.js';
import { unlock, sfx } from './audio.js';

export const menu = { scene: 'title', t: 0 };

const lines = Array.from({ length: 40 }, () => ({
  x: Math.random() * W, y: Math.random() * H,
  len: 10 + Math.random() * 40, speed: 150 + Math.random() * 250,
}));
const brakeDemo = { s: 1, orbX: 158, prevCyc: 0 };

// picks the current run frame safely, debug line
const runFrame = t => {
  const r = courier.run;
  return r && r.length ? r[Math.floor(t * 12) % r.length] : courier.idle;
};

// key movement detector, if detected then,  title-howtoplay-game simple
addEventListener('keydown', e => {
  if (e.repeat || e.code === 'KeyM' || e.ctrlKey || e.metaKey || e.altKey || /^F\d+$/.test(e.code)) return;
  if (menu.scene === 'play') return;
  unlock();
  sfx.blip();
  if (menu.scene === 'title') {
    menu.scene = 'howto';
    menu.t = 0;
  } else {
    menu.scene = 'play';
    startRun();
    endFrame(); 
  }
});

export function updateMenu(dt) {
  menu.t += dt;
  for (const l of lines) {
    l.x -= l.speed * dt;
    if (l.x + l.len < 0) { l.x = W; l.y = Math.random() * H; }
  }

  // Brake demo
  const cyc = menu.t % 6;
  if (cyc < brakeDemo.prevCyc) brakeDemo.orbX = 158;
  brakeDemo.prevCyc = cyc;
  const braking = cyc > 1.2 && cyc < 4.2;
  brakeDemo.s += ((braking ? 0.17 : 1) - brakeDemo.s) * Math.min(1, dt * 10);
  brakeDemo.orbX -= 60 * dt * brakeDemo.s;
}

export function drawMenu(ctx) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);
  if (menu.scene === 'title') drawTitle(ctx);
  else drawHowTo(ctx);
}

// tile
function tile(ctx, img, y, offset) {
  const w = img.width;
  for (let k = Math.floor(offset / w); k * w - offset < W; k++) {
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

function drawTitle(ctx) {
  if (art.scenery) {
    tile(ctx, art.scenery, 40, menu.t * 60);
    ctx.fillStyle = 'rgba(13,17,23,0.72)';
    ctx.fillRect(0, 40, W, 120);
  }
  ctx.fillStyle = COLORS.line;
  ctx.globalAlpha = 0.35;
  for (const l of lines) ctx.fillRect(Math.round(l.x), Math.round(l.y), Math.round(l.len), 1);
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.font = 'bold 44px monospace';
  ctx.fillStyle = COLORS.hazard;
  ctx.fillText('NOZOMI-0', W / 2 + 2, 112);
  ctx.fillStyle = COLORS.line;
  ctx.fillText('NOZOMI-0', W / 2, 110);

  ctx.font = '10px monospace';
  ctx.fillStyle = COLORS.player;
  ctx.fillText('SPEED  =  TIME', W / 2, 132);
  ctx.font = '8px monospace';
  ctx.fillStyle = COLORS.line;
  ctx.fillText('stop the rogue train before it reaches Tokyo', W / 2, 150);

  if (Math.floor(menu.t * 2) % 2 === 0) {
    ctx.font = '10px monospace';
    ctx.fillText('PRESS ANY KEY', W / 2, 200);
  }

  // floor with the courier running across it
  ctx.fillStyle = COLORS.trainLight;
  ctx.fillRect(0, 230, W, 40);
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(0, 230, W, 1);
    const sprite = runFrame(menu.t);
  if (sprite) ctx.drawImage(sprite, Math.round((menu.t * 70) % (W + 40) - 20), 230 - sprite.height);


  ctx.font = '8px monospace';
  ctx.fillText('M = mute', W - 36, 262);
  ctx.textAlign = 'left';
}

function keycap(ctx, x, y, label) {
  ctx.font = '8px monospace';
  const w = Math.max(14, Math.ceil(ctx.measureText(label).width) + 8);
  ctx.fillStyle = COLORS.train;
  ctx.fillRect(x, y, w, 13);
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + 12, w, 1);
  ctx.fillRect(x, y, 1, 13);
  ctx.fillRect(x + w - 1, y, 1, 13);
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 9);
  ctx.textAlign = 'left';
  return w + 3;
}

function keyRow(ctx, x, y, label, keys) {
  ctx.font = '8px monospace';
  ctx.fillStyle = COLORS.player;
  ctx.fillText(label, x, y + 9);
  let kx = x + 46;
  for (const k of keys) kx += keycap(ctx, kx, y, k);
}

function panel(ctx, x, y, w, h, scene) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = COLORS.train;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, 84);
  ctx.clip();
  scene(ctx);
  ctx.restore();
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(0, 0, w, 1);
  ctx.fillRect(0, h - 1, w, 1);
  ctx.fillRect(0, 0, 1, h);
  ctx.fillRect(w - 1, 0, 1, h);
  ctx.restore();
}

function caption(ctx, x, y, title, sub) {
  ctx.textAlign = 'center';
  ctx.font = '8px monospace';
  ctx.fillStyle = COLORS.player;
  ctx.fillText(title, x + 76, y + 95);
  ctx.fillStyle = COLORS.line;
  ctx.fillText(sub, x + 76, y + 105);
  ctx.textAlign = 'left';
}

function floor(ctx) {
  ctx.fillStyle = COLORS.trainLight;
  ctx.fillRect(0, 70, 152, 14);
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(0, 70, 152, 1);
}

// demo 1 orbs and courier and stuff
function demoBrake(ctx) {
  const s = brakeDemo.s;
  const cyc = menu.t % 6;
  ctx.fillStyle = s < 0.6 ? '#0b1a2e' : COLORS.bgLight;
  ctx.fillRect(0, 0, 152, 84);
  ctx.fillStyle = COLORS.line;
  for (let i = 0; i < 6; i++) {
    const lx = (((i * 53 - menu.t * 160 * s) % 152) + 152) % 152;
    ctx.fillRect(Math.round(lx), 8 + i * 6, 16, 1);
  }
  floor(ctx);

  const pulled = cyc > 1.2 && cyc < 4.2;
  ctx.fillStyle = COLORS.playerDark;
  ctx.fillRect(30, 64, 8, 6);
  ctx.fillStyle = pulled ? COLORS.playerDark : COLORS.player;
  if (pulled) {
    ctx.fillRect(33, 64, 5, 2);
  } else {
    ctx.fillRect(33, 56, 2, 8);
    ctx.fillRect(32, 55, 4, 3);
  }
  if (cyc > 0.5 && cyc < 1.2) {
    ctx.fillStyle = COLORS.line;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('E', 34, 50);
    ctx.textAlign = 'left';
  }

  ctx.drawImage(orb, Math.round(brakeDemo.orbX - 3), 61);

  let cx = 52, cy = 57, sprite = courier.idle;
  if (cyc >= 2.4 && cyc < 2.8) {
    const u = (cyc - 2.4) / 0.4;
    cx = 52 + 44 * u;
    cy = 57 - 18 * Math.sin(Math.PI * u);
    sprite = courier.jump;
  } else if (cyc >= 2.8) {
    cx = 96;
  }
  ctx.drawImage(sprite, Math.round(cx), Math.round(cy));

  ctx.font = '8px monospace';
  ctx.fillStyle = COLORS.line;
  ctx.fillText(`${Math.round(300 * s)} km/h`, 5, 11);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.hazard;
  ctx.fillText(`T-${(60 - (menu.t % 60)).toFixed(1)}`, 148, 11);
  ctx.textAlign = 'left';
}

// demo 2 dash
function demoDash(ctx) {
  ctx.fillStyle = COLORS.bgLight;
  ctx.fillRect(0, 0, 152, 84);
  floor(ctx);

  const lx = Math.round(84 + Math.sin(menu.t * 3) * 5);
  ctx.fillStyle = 'rgba(255,42,85,0.25)';
  ctx.fillRect(lx - 3, 4, 7, 64);
  ctx.fillStyle = COLORS.hazard;
  ctx.fillRect(lx - 1, 4, 3, 64);
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(lx, 4, 1, 64);
  ctx.fillStyle = COLORS.hazardDark;
  ctx.fillRect(lx - 4, 3, 9, 3);
  ctx.fillRect(lx - 4, 66, 9, 3);

  const c = menu.t % 3.6;
  let x = 126, sprite = courier.idle, shield = false, dashing = false;
  if (c < 1.2) {
    x = 12 + 40 * (c / 1.2);
      sprite = runFrame(menu.t);
  } else if (c < 1.6) {
    x = 52 + 66 * ((c - 1.2) / 0.4);
    shield = true;
    dashing = true;
  } else if (c < 1.8) {
    x = 118 + 8 * ((c - 1.6) / 0.2);
    shield = true;
  }

  if (dashing) {
    for (let k = 1; k <= 3; k++) {
      ctx.globalAlpha = 0.25 / k;
      ctx.drawImage(sprite, Math.round(x - k * 8), 57);
    }
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(sprite, Math.round(x), 57);
  if (shield) {
    ctx.strokeStyle = COLORS.player;
    ctx.fillStyle = 'rgba(0,240,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(Math.round(x + 5), 63, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (c > 0.9 && c < 1.3) keycap(ctx, 30, 34, 'SHIFT');
}
// demo 3 cars
function demoCars(ctx) {
  ctx.fillStyle = COLORS.bgLight;
  ctx.fillRect(0, 0, 152, 84);
  const active = Math.floor(menu.t * 1.1) % 5; // 0 to 3 = cars - 4 = arrived, understandable duh

  ctx.drawImage(core, 122, 24);
  ctx.font = '8px monospace';
  for (let i = 0; i < 4; i++) {
    const x = 8 + i * 36, y = 40;
    if (i < 3) {
      ctx.fillStyle = COLORS.line;
      ctx.fillRect(x + 30, y + 10, 6, 2);
    }
    ctx.fillStyle = i < active ? COLORS.playerDark : i === active ? COLORS.player : COLORS.trainLight;
    ctx.fillRect(x, y, 30, 20);
    ctx.fillStyle = COLORS.line;
    ctx.fillRect(x, y, 30, 1);
    ctx.fillRect(x, y + 19, 30, 1);
    ctx.fillRect(x, y, 1, 20);
    ctx.fillRect(x + 29, y, 1, 20);
    ctx.fillStyle = i === active ? COLORS.bg : COLORS.line;
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), x + 15, y + 13);
    if (i === active - 1 && i < 3) {
      ctx.fillStyle = COLORS.player;
      ctx.fillText('+15s', x + 15, y - 5);
    }
  }
  ctx.fillStyle = COLORS.line;
  ctx.fillText('TOTAL 120s', 76, 72);
  if (active === 4) {
    ctx.fillStyle = COLORS.player;
    ctx.fillText('TRAIN STOPPED', 76, 82);
  }
  ctx.textAlign = 'left';
}

function drawHowTo(ctx) {
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.line;
  ctx.font = 'bold 14px monospace';
  ctx.fillText('HOW TO PLAY', W / 2, 22);
  ctx.textAlign = 'left';

  panel(ctx, 8, 34, 152, 108, demoBrake);
  panel(ctx, 164, 34, 152, 108, demoDash);
  panel(ctx, 320, 34, 152, 108, demoCars);
  caption(ctx, 8, 34, '1  BRAKE LEVER', 'slows the world down');
  caption(ctx, 164, 34, '2  DASH', 'dash through lasers, cool shield ');
  caption(ctx, 320, 34, '3  FOUR CARS', 'each car cleared gives ya +15s');

  keyRow(ctx, 10, 154, 'MOVE', ['A', 'D']);
  keyRow(ctx, 10, 172, 'JUMP', ['W', 'SPACE']);
  keyRow(ctx, 168, 154, 'DASH', ['SHIFT', 'K']);
  keyRow(ctx, 168, 172, 'USE', ['E', 'J']);
  keyRow(ctx, 326, 154, 'RESTART', ['R']);
  keyRow(ctx, 326, 172, 'MUTE', ['M']);

  ctx.fillStyle = COLORS.trainLight;
  ctx.fillRect(8, 196, 464, 1);
  ctx.textAlign = 'center';
  ctx.font = '8px monospace';
  ctx.fillStyle = COLORS.line;
  ctx.fillText('Brake levers are one time, and time never stops for you.', W / 2, 214);
  ctx.fillText('Reach the engine room-overload the AI core-Stop the train', W / 2, 228);
  if (Math.floor(menu.t * 2) % 2 === 0) {
    ctx.font = '10px monospace';
    ctx.fillStyle = COLORS.player;
    ctx.fillText('PRESS ANY KEY TO START', W / 2, 256);
  }
  ctx.textAlign = 'left';
}