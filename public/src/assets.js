// Loads images and turns them into chunky pixel art.
// A missing file goes back to flat colors
function load(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { console.warn('missing asset:', src); resolve(null); };
    img.src = src;
  });
}

// Crop, shrink to a tiny size cuz i lik pixel
function pixelate(img, smallH, outH, crop = { x: 0, y: 0, w: 1, h: 1 }) {
  if (!img) return null;
  const sx = img.width * crop.x, sy = img.height * crop.y;
  const sw = img.width * crop.w, sh = img.height * crop.h;
  const smallW = Math.round(smallH * sw / sh);

  const small = document.createElement('canvas');
  small.width = smallW;
  small.height = smallH;
  const g = small.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, sx, sy, sw, sh, 0, 0, smallW, smallH);

  const scale = outH / smallH;
  const out = document.createElement('canvas');
  out.width = Math.round(smallW * scale);
  out.height = outH;
  const o = out.getContext('2d');
  o.imageSmoothingEnabled = false;
  o.drawImage(small, 0, 0, out.width, out.height);
  return out;
}

export const art = { scenery: null, interior: null, dining: null, night: null, dawn: null };

export async function loadArt() {
  const [s, i, d, n, w] = await Promise.all([
    load('assets/scenery.jpg'),
    load('assets/interior.jpg'),
    load('assets/dining.jpg'),
    load('assets/night.jpg'),
    load('assets/dawn.jpg'),
  ]);
  art.scenery = pixelate(s, 60, 120);
  art.interior = pixelate(i, 110, 220);
  art.dining = pixelate(d, 110, 220, { x: 0.04, y: 0.05, w: 0.92, h: 0.80 });
  art.night = pixelate(n, 60, 120, { x: 0.22, y: 0.05, w: 0.78, h: 0.90 });
  art.dawn = pixelate(w, 60, 120, { x: 0.03, y: 0.08, w: 0.94, h: 0.84 });
  console.log('art loaded', ...Object.values(art).map(Boolean));
}



