// Every tunable number is here so balancing is one-file work.
export const W = 480;
export const H = 270; // for pixel purposes.

export const COLORS = { // adding more shades.
  bg: '#0D1117',
  bgLight: '#161B22',
  train: '#21262D',
  trainLight: '#30363D',
  line: '#FFFFFF', // this should be white, azure aint that gud.
  hazard: '#FF2A55',
  hazardDark: '#8A1230',
  player: '#00F0FF',
  playerDark: '#0088A0',
};
// pretty proud of my color selection here.

export const KEYS = {
  b: COLORS.bg,
  g: COLORS.bgLight,
  k: COLORS.train,
  l: COLORS.trainLight,
  w: COLORS.line,
  r: COLORS.hazard,
  o: COLORS.hazardDark,
  c: COLORS.player,
  d: COLORS.playerDark,
};

// one letter per color, will come handy later,. in sprites.

export const TRAIN = {
  base: 300,
  slow: 50,
  hyper: 400,
  brakeDuration: 3.5, // seconds of slow-mo
  accel: 0.8,         // how fast speed recovers
  brakeRate: 14,      // how fast speed drops
};

// same train used by time.js.
// physics tuned for the 480x270 canvas pps
export const GRAVITY = 900; // gravity used in player.js

export const PLAYER = {
  w: 10, h: 13,
  speed: 130, accel: 1200, airAccel: 800,
  jump: 320, maxFall: 450, cutGravity: 1.6, // cutGravity: extra gravity when you release jump early
  coyote: 0.1,       // seconds you can still jump after leaving a ledge
  jumpBuffer: 0.12,  // seconds a jump press is remembered before landing
  dashSpeed: 310, dashTime: 0.16, dashCooldown: 0.5,
}; // used in player.js 

export const RUN_TIME = 60; // seconds on the arrival countdown