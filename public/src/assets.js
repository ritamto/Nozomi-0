// Loads photos and shrink to pixely :)
// A missing file resolves to null and the game falls back to flat colors.
function load(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { console.warn('missing asset:', src); resolve(null); };
    img.src = src;
  });
}

// downscale.
function shrink(img, h) {
  if (!img) return null;
  const w = Math.round(img.width * h / img.height);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, w, h);
  return c;
}

export const art = { scenery: null, interior: null, dining: null };

export async function loadArt() {
  const [s, i, d] = await Promise.all([
    load('assets/scenery.jpg'),
    load('assets/interior.jpg'),
    load('assets/dining.jpg'),
  ]);
  art.scenery = shrink(s, 120);
  art.interior = shrink(i, 220);
  art.dining = shrink(d, 220);
}