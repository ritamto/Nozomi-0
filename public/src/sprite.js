import { KEYS } from './config.js'; // the keys shortcts for colors i just made.

export function makeSprite(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const color = KEYS[row[x]];
      if (color) {
        g.fillStyle = color;
        g.fillRect(x, y, 1, 1);
      }
    }
  });
  return c;
}

// Mirror a sprite horizontally (for facing left).
export function flip(sprite) {
  const c = document.createElement('canvas');
  c.width = sprite.width;
  c.height = sprite.height;
  const g = c.getContext('2d');
  g.translate(sprite.width, 0);
  g.scale(-1, 1);
  g.drawImage(sprite, 0, 0);
  return c;
}

// sprites ↑