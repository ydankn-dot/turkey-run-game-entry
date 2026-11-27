// The screenshot scenes behind ?shot=title|play|chase|end. Each one plays
// the real rules forward from a fresh world for a fixed number of steps,
// steered by a simple autopilot (jump the fences, pumpkins and traps, duck
// the knives, hide in the hay when the farmer closes in), so every frame is
// what a short game really looks like — and the same seed always gives the
// same frame.
import { KIND_HAY, KIND_KNIFE, runSpeed } from './levels.js';
import {
  SCREEN_CAUGHT,
  SCREEN_PLAY,
  SCREEN_TITLE,
  STEP,
  startRun,
  stepGame,
} from './game.js';

const PLAY_SECONDS = 16;
const CHASE_GOOD_SECONDS = 22;
const CHASE_BAD_SECONDS = 6;
const END_LIMIT_SECONDS = 240;

/** A stub input that presses what the autopilot asks for, one step at a time. */
function makePilotInput() {
  const queue = new Set();
  const held = new Set();
  return {
    press(action) {
      queue.add(action);
    },
    hold(action) {
      held.add(action);
    },
    release(action) {
      held.delete(action);
    },
    isHeld(action) {
      return held.has(action);
    },
    wasPressed(action) {
      if (!queue.has(action)) return false;
      queue.delete(action);
      return true;
    },
    takeClicks() {
      return [];
    },
    clear() {},
  };
}

const silentAudio = {
  jump() {},
  hurt() {},
  pickup() {},
  hide() {},
  lose() {},
  win() {},
  gobble() {},
  unlock() {},
  toggleMute() {
    return false;
  },
};

/** The next hazard the turkey is about to meet, if any. */
function nextHazard(game) {
  let best = null;
  for (const obstacle of game.obstacles) {
    if (!obstacle.active || obstacle.kind === KIND_HAY) continue;
    if (obstacle.x + obstacle.width < game.turkey.x) continue;
    if (best === null || obstacle.x < best.x) best = obstacle;
  }
  return best;
}

/** The nearest haystack the turkey could hide in, if any. */
function nextHaystack(game) {
  for (const obstacle of game.obstacles) {
    if (!obstacle.active || obstacle.kind !== KIND_HAY) continue;
    if (obstacle.x < game.turkey.x - 40) continue;
    return obstacle;
  }
  return null;
}

/**
 * Steer one step: jump what must be jumped, duck the knives, and hide when
 * the farmer is close and a haystack is at hand. `care` is how far ahead
 * the pilot looks: a careful pilot (0.7) survives, a reckless one (0.0)
 * jumps too late and never ducks, which is how the chase scene lets the
 * farmer close in. A jump is timed to the turkey's airtime, so it leaves
 * the ground about a third of a second before the hazard arrives.
 */
function autopilot(game, input, care) {
  const turkey = game.turkey;
  if (turkey.hiding) return;
  const reckless = care < 0.1;
  // Knives outrank everything: a jump into a knife is worse than a late
  // jump over a fence, so duck first whenever one is close.
  let knife = null;
  for (const obstacle of game.obstacles) {
    if (!obstacle.active || obstacle.kind !== KIND_KNIFE) continue;
    const gap = obstacle.x - (turkey.x + turkey.width);
    if (gap > -20 && gap < 320 && (knife === null || obstacle.x < knife.x)) knife = obstacle;
  }
  if (knife && !reckless) {
    input.hold('duck');
  } else {
    input.release('duck');
  }
  const hazard = nextHazard(game);
  if (hazard) {
    const gap = hazard.x - (turkey.x + turkey.width);
    if (hazard.kind === KIND_KNIFE) {
      if (gap < 240 && !reckless) input.hold('duck');
      else input.release('duck');
    } else if (turkey.grounded && !knife) {
      input.release('duck');
      const speed = runSpeed(game.distance);
      const jumpAt = reckless ? speed * 0.16 : speed * (0.30 + care * 0.06);
      if (gap < jumpAt && gap > -20) input.press('jump');
    }
  } else if (!knife) {
    input.release('duck');
  }
  if (game.farmer.gap < 150) {
    const hay = nextHaystack(game);
    if (hay && Math.abs(hay.x - turkey.x) < 90 && turkey.grounded) {
      input.press('hide');
    }
  }
}

function runSteps(game, input, seconds, care) {
  const steps = Math.floor(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (game.screen !== SCREEN_PLAY) break;
    autopilot(game, input, care);
    stepGame(game, input, silentAudio);
  }
}

/**
 * Set `game` to the named scene and return the screen to draw. The scenes
 * are: title (the title screen over a quiet farmyard), play (a mid-run
 * farmyard with the HUD), chase (deep in the run, the farmer right behind
 * the turkey with SPOTTED flashing) and end (the escaped screen after a
 * full run).
 */
export function stageShot(name, game) {
  const input = makePilotInput();
  if (name !== 'play' && name !== 'chase' && name !== 'end') {
    // Title: idle the farmyard for a few seconds so the scene settles.
    for (let i = 0; i < 5 / STEP; i += 1) {
      game.time += STEP;
      game.scroll += 24 * STEP;
      game.turkey.runPhase += STEP * 4;
    }
    return { screen: SCREEN_TITLE, best: 0 };
  }
  startRun(game);
  if (name === 'play') {
    runSteps(game, input, PLAY_SECONDS, 0.7);
    return { screen: game.screen, best: game.score };
  }
  if (name === 'chase') {
    runSteps(game, input, CHASE_GOOD_SECONDS, 0.7);
    runSteps(game, input, CHASE_BAD_SECONDS, 0.0);
    return { screen: game.screen, best: game.score };
  }
  // End: a careful pilot runs the whole escape.
  runSteps(game, input, END_LIMIT_SECONDS, 0.75);
  return { screen: game.screen, best: game.score };
}

export { SCREEN_CAUGHT };
