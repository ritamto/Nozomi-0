// ts holds tha trains speed and braking state.
import { TRAIN } from './config.js';

export const train = {
  speed: TRAIN.base,
  target: TRAIN.base,
  brakeLeft: 0,
  pulls: 0,
};

export function pullBrake() {
  if (train.brakeLeft > 0) return false; // already braking
  train.brakeLeft = TRAIN.brakeDuration;
  train.pulls++;
  return true;
}

export function updateTrain(dt) {
  if (train.brakeLeft > 0) {
    train.brakeLeft = Math.max(0, train.brakeLeft - dt);
    train.speed += (TRAIN.slow - train.speed) * Math.min(1, dt * TRAIN.brakeRate);
  } else {
    train.speed += (train.target - train.speed) * Math.min(1, dt * TRAIN.accel);
  }
}

// The one global multiplier.
export const timeScale = () => train.speed / TRAIN.base;
export const braking = () => train.brakeLeft > 0;

export function resetTrain() {
  train.speed = TRAIN.base;
  train.target = TRAIN.base;
  train.brakeLeft = 0;
  train.pulls = 0;
}

// Used on death: back to cruising speed without wiping the brake-pull count.
export function resetSpeed() {
  train.speed = train.target;
  train.brakeLeft = 0;
}
// speed reset above, :/

export function stopTrain(dt) {
  train.target = 0;
  train.speed = Math.max(0, train.speed - 250 * dt);
}

// Used on arrival, the train rolls to a halt.