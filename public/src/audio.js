import { game } from './game.js';
import { train, timeScale } from './time.js';

// all sound effects are synthesized with web audio, aint using sfx.
let ac = null, master = null, noiseBuf = null, hum = null, music = null;
let muted = false;



export function unlock() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ac.destination);

    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    hum = makeHum();
    loadMusic();
  }
  if (ac.state === 'suspended') ac.resume();
}

// clcik for music
addEventListener('keydown', e => {
  unlock();
  if (e.code === 'KeyM' && !e.repeat && ac) {
    muted = !muted;
    master.gain.setTargetAtTime(muted ? 0 : 0.5, ac.currentTime, 0.02);
  }
});
addEventListener('pointerdown', unlock);

async function loadMusic() {
  try {
    const res = await fetch('assets/music.mp3'); // da music i added
    if (!res.ok) return;
    const buf = await ac.decodeAudioData(await res.arrayBuffer());
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const gain = ac.createGain();
    gain.gain.value = 0;
    src.connect(gain);
    gain.connect(master);
    src.start();
    music = { src, gain };
  } catch (e) {
    console.warn('music failed to load', e);
  }
}

function makeHum() {
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  const gain = ac.createGain();
  gain.gain.value = 0;
  const bGain = ac.createGain();
  bGain.gain.value = 0.5;
  const a = ac.createOscillator();
  a.type = 'sawtooth';
  a.frequency.value = 110;
  const b = ac.createOscillator();
  b.type = 'square';
  b.frequency.value = 110.8; // slightly detuned for a thick drone
  a.connect(filter);
  b.connect(bGain);
  bGain.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  a.start();
  b.start();
  return { a, b, filter, gain };
}

function tone(type, f0, f1, dur, vol = 0.2, delay = 0) {
  if (!ac) return;
  const t = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, vol, f0, f1, delay = 0) {
  if (!ac) return;
  const t = ac.currentTime + delay;
  const s = ac.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f);
  f.connect(g);
  g.connect(master);
  s.start(t);
  s.stop(t + dur + 0.02);
}

export const sfx = {
  blip: () => tone('square', 660, 660, 0.05, 0.08),
  jump: () => tone('square', 280, 520, 0.09, 0.07),
  dash: () => { noise(0.18, 0.25, 800, 3000); tone('sine', 400, 900, 0.12, 0.08); },
  brake: () => { tone('sawtooth', 500, 60, 0.6, 0.18); noise(0.3, 0.15, 2000, 200); },
  die: () => { tone('sawtooth', 320, 40, 0.4, 0.2); noise(0.25, 0.25, 1500, 200); },
  zap: () => { tone('square', 900, 150, 0.12, 0.12); tone('square', 1200, 200, 0.1, 0.1, 0.08); },
  overload: () => { noise(0.8, 0.35, 3000, 100); tone('sawtooth', 200, 30, 0.8, 0.25); },
  bonus: () => [523, 659, 784].forEach((f, i) => tone('triangle', f, f, 0.12, 0.15, i * 0.07)),
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, i === 3 ? 0.6 : 0.14, 0.18, i * 0.13));
    tone('square', 1047, 1047, 0.6, 0.05, 0.39);
  },
  lose: () => [330, 262, 196, 130].forEach((f, i) => tone('sawtooth', f, f * 0.95, 0.22, 0.14, i * 0.17)),
};

const prev = { deaths: 0, pulls: 0, breakers: 0, overloaded: false, state: 'play', car: 0, dash: false, grounded: false };

export function updateAudio(playing) {
  if (!ac || !hum) return;
  const now = ac.currentTime;

  const ts = playing ? timeScale() : 0.7;
  const f = 0.5 + 0.5 * Math.min(1.4, Math.max(0, (ts - 0.17) / 0.83));
  let level = playing ? 0.07 : 0.03;
  if (music) level *= 0.3; // the music carries the mood, the hum just adds weight
  if (playing && game.state === 'won') level *= Math.min(1, train.speed / 60);
  if (playing && game.state === 'lost') level = 0.02;
  hum.a.frequency.setTargetAtTime(110 * f, now, 0.06);
  hum.b.frequency.setTargetAtTime(110.8 * f, now, 0.06);
  hum.filter.frequency.setTargetAtTime(150 + 400 * f, now, 0.06);
  hum.gain.gain.setTargetAtTime(level, now, 0.1);

  if (music) {
    music.src.playbackRate.setTargetAtTime(f, now, 0.08);
    const vol = !playing ? 0.3 : game.state === 'lost' ? 0.15 : 0.4;
    music.gain.gain.setTargetAtTime(vol, now, 0.3);
  }

  if (!playing || !game.player || !game.car) return;
  const p = game.player, c = game.car;
  const bOn = (c.breakers ?? []).filter(b => b.on).length;
  const ovl = !!c.core?.overloaded;
  const dashing = p.dashT > 0;

  if (game.deaths > prev.deaths) {
    sfx.die();
  } else {
    if (train.pulls > prev.pulls) sfx.brake();
    if (ovl && !prev.overloaded) sfx.overload();
    else if (bOn > prev.breakers) sfx.zap();
    if (game.carIndex > prev.car && game.bonusT > 0) sfx.bonus();
    if (dashing && !prev.dash) sfx.dash();
    if (prev.grounded && p.vy < -150) sfx.jump();
    if (game.state !== prev.state) {
      if (game.state === 'won') sfx.win();
      if (game.state === 'lost') sfx.lose();
    }
  }

  prev.deaths = game.deaths;
  prev.pulls = train.pulls;
  prev.breakers = bOn;
  prev.overloaded = ovl;
  prev.state = game.state;
  prev.car = game.carIndex;
  prev.dash = dashing;
  prev.grounded = p.grounded;
}