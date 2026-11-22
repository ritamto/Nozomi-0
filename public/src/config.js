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