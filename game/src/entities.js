// The actors of Gobble Dash: the turkey, the farmer, the hazards and the
// pickups. This file owns their state and their per-step updates; render.js
// owns how they look. All motion is in pixels and seconds, driven by the
// fixed step in game.js, so the same seed always plays the same way.
import {
  KIND_CORN,
  KIND_FEATHER,
  KIND_FENCE,
  KIND_HAY,
  KIND_KNIFE,
  KIND_OVEN,
  KIND_PIE,
  KIND_PUMPKIN,
  KIND_TRAP,
  PICKUP_SCORE,
} from './levels.js';

export const GROUND_Y = 600;
export const TURKEY_X = 300;
export const GRAVITY = 2400;
export const JUMP_SPEED = 1050;

export function makeTurkey() {
  return {
    x: TURKEY_X,
    y: GROUND_Y - 78,
    width: 66,
    height: 78,
    vy: 0,
    grounded: true,
    sliding: false,
    slideTime: 0,
    hiding: false,
    hideTime: 0,
    invulnTime: 0,
    runPhase: 0,
    flap: 0,
  };
}

export function makeFarmer() {
  return {
    gap: 300, // pixels behind the turkey; 0 means caught
    searching: false,
    searchTime: 0,
    runPhase: 0,
    shoutTime: 0,
  };
}

/** Sizes of every hazard and pickup, in pixels. */
export const SIZES = {
  [KIND_FENCE]: { width: 46, height: 74 },
  [KIND_KNIFE]: { width: 58, height: 16 },
  [KIND_PUMPKIN]: { width: 52, height: 48 },
  [KIND_OVEN]: { width: 100, height: 96 },
  [KIND_TRAP]: { width: 56, height: 22 },
  [KIND_HAY]: { width: 96, height: 92 },
  [KIND_CORN]: { width: 34, height: 40 },
  [KIND_FEATHER]: { width: 30, height: 38 },
  [KIND_PIE]: { width: 40, height: 30 },
};

export function makeObstacle(kind, x, rng) {
  const size = SIZES[kind];
  const obstacle = {
    kind,
    x,
    y: GROUND_Y - size.height,
    width: size.width,
    height: size.height,
    active: true,
    passed: false,
    spin: 0,
  };
  if (kind === KIND_KNIFE) {
    // A thrown knife flies at head height and tumbles: a standing turkey
    // is hit, a sliding one ducks under it.
    obstacle.y = GROUND_Y - 66 - rng.range(0, 20);
    obstacle.vx = -140;
    obstacle.spin = rng.range(2, 5);
  }
  if (kind === KIND_PUMPKIN) {
    obstacle.spin = rng.range(3, 6);
  }
  return obstacle;
}

export function makePickup(kind, x, y) {
  const size = SIZES[kind];
  return {
    kind,
    x,
    y,
    width: size.width,
    height: size.height,
    active: true,
    bob: 0,
  };
}

/** The turkey's collision box: shorter while sliding, none while hiding. */
export function turkeyBox(turkey) {
  if (turkey.hiding) return null;
  if (turkey.sliding) {
    return { x: turkey.x, y: turkey.y + 42, width: turkey.width, height: 36 };
  }
  return { x: turkey.x, y: turkey.y, width: turkey.width, height: turkey.height };
}

export function boxesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function updateTurkey(turkey, input, dt) {
  turkey.invulnTime = Math.max(0, turkey.invulnTime - dt);
  if (turkey.hiding) {
    turkey.hideTime -= dt;
    if (turkey.hideTime <= 0) turkey.hiding = false;
    return;
  }
  if (turkey.sliding) {
    turkey.slideTime -= dt;
    if (turkey.slideTime <= 0) turkey.sliding = false;
  }
  if (!turkey.grounded) {
    turkey.vy += GRAVITY * dt;
    turkey.y += turkey.vy * dt;
    turkey.flap = Math.max(0, turkey.flap - dt);
    if (turkey.y >= GROUND_Y - turkey.height) {
      turkey.y = GROUND_Y - turkey.height;
      turkey.vy = 0;
      turkey.grounded = true;
    }
  }
  turkey.runPhase += dt * 11;
}

/** Try to start a jump; returns true when the turkey left the ground. */
export function turkeyJump(turkey) {
  if (turkey.hiding || !turkey.grounded || turkey.sliding) return false;
  turkey.vy = -JUMP_SPEED;
  turkey.grounded = false;
  turkey.flap = 0.28;
  return true;
}

/** Try to start a slide; returns true when the turkey dropped low. */
export function turkeySlide(turkey) {
  if (turkey.hiding || !turkey.grounded || turkey.sliding) return false;
  turkey.sliding = true;
  turkey.slideTime = 0.4;
  return true;
}

/** Try to hide in a haystack; returns true when the turkey ducked in. */
export function turkeyHide(turkey, haystack) {
  if (!haystack || turkey.hiding || !turkey.grounded) return false;
  turkey.hiding = true;
  turkey.hideTime = 1.6;
  turkey.x = haystack.x + (haystack.width - turkey.width) / 2;
  turkey.y = GROUND_Y - turkey.height;
  return true;
}

/**
 * The farmer: he gains on the turkey whenever it stumbles, and falls back
 * while it runs clean. While the turkey hides he stops, searches the
 * haystack, then gives up and drops further back than before.
 */
export function updateFarmer(farmer, turkey, dt, cleanRun) {
  farmer.runPhase += dt * 10;
  farmer.shoutTime = Math.max(0, farmer.shoutTime - dt);
  if (farmer.searching) {
    farmer.searchTime -= dt;
    if (farmer.searchTime <= 0) {
      farmer.searching = false;
      farmer.gap += 170;
    }
    return;
  }
  if (turkey.hiding) {
    farmer.searching = true;
    farmer.searchTime = 1.4;
    farmer.shoutTime = 1.4;
    return;
  }
  if (cleanRun) farmer.gap = Math.min(320, farmer.gap + 14 * dt);
  else farmer.gap = Math.max(0, farmer.gap - 6 * dt);
}

export function updateObstacle(obstacle, speed, dt) {
  obstacle.x -= speed * dt;
  if (obstacle.kind === KIND_KNIFE) {
    obstacle.x += obstacle.vx * dt;
    obstacle.spin += dt * 9;
  }
  if (obstacle.kind === KIND_PUMPKIN) {
    obstacle.spin += dt * 7;
  }
  if (obstacle.x + obstacle.width < -40) obstacle.active = false;
}

export function updatePickup(pickup, speed, dt, time) {
  pickup.x -= speed * dt;
  pickup.bob = Math.sin(time * 3 + pickup.x * 0.02) * 6;
  if (pickup.x + pickup.width < -40) pickup.active = false;
}

/** Points a pickup is worth. */
export function pickupScore(kind) {
  return PICKUP_SCORE[kind] ?? 0;
}
