// for inputs...
const MAP = {
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  jump: ['KeyW', 'ArrowUp', 'Space'],
  dash: ['ShiftLeft', 'ShiftRight', 'KeyK'],
  interact: ['KeyE', 'KeyJ'],
  restart: ['KeyR'],
};

const held = new Set();
const pressed = new Set();
const BLOCK = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

addEventListener('keydown', e => {
  if (!held.has(e.code)) pressed.add(e.code);
  held.add(e.code);
  if (BLOCK.includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => held.delete(e.code));
addEventListener('blur', () => held.clear());

export const down = action => MAP[action].some(k => held.has(k));   // held right now
export const hit = action => MAP[action].some(k => pressed.has(k)); // pressed this frame
export const endFrame = () => pressed.clear();                      // call once per frame