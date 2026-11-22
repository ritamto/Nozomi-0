import { makeSprite } from './sprite.js';

const top = [
  '...dddd...',
  '..dccccd..',
  '..cwwwwc..',
  '..cwkkwc..',
  '..dccccd..',
  '.dccccccd.',
  '.cccwwccc.',
  '.cccccccc.',
  '.dcccccd..',
];

const legs = {
  idle: ['..cc..cc..', '..cc..cc..', '..dd..dd..', '..kk..kk..'],
  runA: ['..cc..cc..', '.cc....cc.', '.dd....dd.', '.kk....kk.'],
  runB: ['...cccc...', '...cddc...', '...dkkd...', '...kkkk...'],
  jump: ['.cc....cc.', '.dd....dd.', '..........', '..........'],
};

const build = l => makeSprite([...top, ...l]);

export const courier = {
  idle: build(legs.idle),
  run: [build(legs.runA), build(legs.idle), build(legs.runB), build(legs.idle)],
  jump: build(legs.jump),
};