import { PLAYER as P, GRAVITY } from './config.js';
import { down, hit } from './input.js';

const approach = (v, target, step) =>
  v < target ? Math.min(v + step, target) : Math.max(v - step, target);

const overlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function createPlayer(x, y) {
  return {
    x, y, w: P.w, h: P.h,
    vx: 0, vy: 0, face: 1,
    grounded: false,
    coyote: 0, buffer: 0,
    dashT: 0, dashCd: 0, dashDir: 1, shieldT: 0, //shield!!!!
    invuln: false,
  };
}


export function updatePlayer(p, dt, solids) {
  const dir = (down('right') ? 1 : 0) - (down('left') ? 1 : 0);
  if (dir) p.face = dir;

  // dash
    if (hit('dash') && p.dashCd <= 0) {
    p.dashT = P.dashTime;
    p.shieldT = P.dashTime + P.dashGrace;
    p.dashCd = P.dashCooldown;
    p.dashDir = p.face;
  }
  p.dashT = Math.max(0, p.dashT - dt);
  p.dashCd = Math.max(0, p.dashCd - dt);
  p.shieldT = Math.max(0, p.shieldT - dt);
  p.invuln = p.shieldT > 0;

  if (p.dashT > 0) {
    p.vx = p.dashDir * P.dashSpeed;
    p.vy = 0;
  } else {
    p.vx = approach(p.vx, dir * P.speed, (p.grounded ? P.accel : P.airAccel) * dt);
    p.vy = Math.min(p.vy + GRAVITY * dt, P.maxFall);
    // variable jump height: releasing jump early cuts the rise short
    if (!down('jump') && p.vy < 0) p.vy += GRAVITY * P.cutGravity * dt;
  }

  // coyote time + jump buffer
  p.coyote = p.grounded ? P.coyote : p.coyote - dt;
  p.buffer = hit('jump') ? P.jumpBuffer : p.buffer - dt;
  if (p.buffer > 0 && p.coyote > 0) {
    p.vy = -P.jump;
    p.buffer = 0;
    p.coyote = 0;
    p.grounded = false;
  }

  // move X, then Y, resolving collisions per axis
  p.x += p.vx * dt;
  for (const s of solids) {
    if (overlap(p, s)) {
      p.x = p.vx > 0 ? s.x - p.w : s.x + s.w;
      p.vx = 0;
    }
  }

  p.y += p.vy * dt;
  p.grounded = false;
  for (const s of solids) {
    if (overlap(p, s)) {
      if (p.vy > 0) { p.y = s.y - p.h; p.grounded = true; }
      else p.y = s.y + s.h;
      p.vy = 0;
    }
  }
}