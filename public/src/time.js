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