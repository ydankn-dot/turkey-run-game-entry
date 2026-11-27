// The rules of Gobble Dash: the state machine, the fixed-step loop, the
// spawning, the collisions and the scoring. The turkey runs right while the
// world scrolls left; the farmer chases from behind; 1000 metres of clean
// running ends in escape, and three hits — or the farmer closing the gap —
// ends in capture.
import { makeRng } from './rng.js';
import {
  KIND_CORN,
  KIND_FEATHER,
  KIND_HAY,
  KIND_PIE,
  METRES_TO_ESCAPE,
  PIXELS_PER_METRE,
  pickHazard,
  runSpeed,
  spawnGap,
  stageFor,
} from './levels.js';
import {
  GROUND_Y,
  boxesOverlap,
  makeFarmer,
  makeObstacle,
  makePickup,
  makeTurkey,
  pickupScore,
  turkeyBox,
  turkeyHide,
  turkeyJump,
  turkeySlide,
  updateFarmer,
  updateObstacle,
  updatePickup,
  updateTurkey,
} from './entities.js';
import { VIEW_WIDTH } from './render.js';

export const STEP = 1 / 60;
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_ESCAPED = 'escaped';

export function makeGame(seed = 7, best = 0) {
  const rng = makeRng(seed);
  const game = {
    seed,
    rng,
    time: 0,
    scroll: 0,
    distance: 0,
    score: 0,
    best,
    hearts: 3,
    corn: 0,
    feathers: 0,
    pickupBonus: 0,
    screen: SCREEN_TITLE,
    stage: stageFor(0),
    turkey: makeTurkey(),
    farmer: makeFarmer(),
    obstacles: [],
    pickups: [],
    nextSpawnIn: 420,
    hintTime: 0,
    muted: false,
    buttons: {},
    cleanTime: 0,
  };
  return game;
}

export function startRun(game) {
  const best = game.best;
  const fresh = makeGame(game.seed, best);
  Object.assign(game, fresh, { muted: game.muted });
  game.screen = SCREEN_PLAY;
  game.hintTime = 3;
}

function spawnPattern(game) {
  const rng = game.rng;
  const stage = game.stage;
  const x = VIEW_WIDTH + 80;
  const kind = pickHazard(rng, stage.id);
  game.obstacles.push(makeObstacle(kind, x, rng));
  // A pickup trail rides just past most hazards, rewarding the jump.
  if (kind !== KIND_HAY && rng.chance(0.65)) {
    const pickupKind = rng.chance(0.12) ? KIND_FEATHER : rng.chance(0.3) ? KIND_PIE : KIND_CORN;
    const count = pickupKind === KIND_CORN ? 3 : 1;
    for (let i = 0; i < count; i += 1) {
      game.pickups.push(makePickup(pickupKind, x + 70 + i * 44, GROUND_Y - 130 - (i % 2) * 30));
    }
  }
  if (kind === KIND_HAY && rng.chance(0.5)) {
    game.pickups.push(makePickup(KIND_PIE, x + 130, GROUND_Y - 110));
  }
}

function nearestHaystack(game) {
  for (const obstacle of game.obstacles) {
    if (!obstacle.active || obstacle.kind !== KIND_HAY) continue;
    if (Math.abs(obstacle.x - game.turkey.x) < 110) return obstacle;
  }
  return null;
}

function hurtTurkey(game) {
  const turkey = game.turkey;
  if (turkey.invulnTime > 0 || turkey.hiding) return;
  game.hearts -= 1;
  turkey.invulnTime = 1.4;
  game.farmer.gap = Math.max(0, game.farmer.gap - 95);
  game.farmer.shoutTime = 1.2;
  game.cleanTime = 0;
  if (game.hearts <= 0) {
    endRun(game, SCREEN_CAUGHT);
  }
}

function endRun(game, screen) {
  game.screen = screen;
  if (screen === SCREEN_ESCAPED) game.score += 500;
  game.best = Math.max(game.best, game.score);
}

function stepPlay(game, input, audio) {
  const dt = STEP;
  const turkey = game.turkey;
  const speed = runSpeed(game.distance);

  if (input.wasPressed('jump') && turkeyJump(turkey)) audio.jump();
  if (input.isHeld('duck') && turkey.grounded) turkeySlide(turkey);
  if (input.wasPressed('hide')) {
    const hay = nearestHaystack(game);
    if (turkeyHide(turkey, hay)) audio.hide();
  }

  game.scroll += speed * dt;
  game.distance = game.scroll / PIXELS_PER_METRE;
  game.score = Math.floor(game.distance) + game.pickupBonus;
  game.time += dt;
  game.cleanTime += dt;
  game.hintTime = Math.max(0, game.hintTime - dt);

  const stage = stageFor(game.distance);
  if (stage.id !== game.stage.id) {
    game.stage = stage;
    game.hintTime = 3;
  }

  updateTurkey(turkey, input, dt);
  updateFarmer(game.farmer, turkey, dt, game.cleanTime > 4);

  game.nextSpawnIn -= speed * dt;
  if (game.nextSpawnIn <= 0) {
    spawnPattern(game);
    game.nextSpawnIn = spawnGap(game.distance) * (0.8 + game.rng.next() * 0.5);
  }

  for (const obstacle of game.obstacles) updateObstacle(obstacle, speed, dt);
  for (const pickup of game.pickups) updatePickup(pickup, speed, dt, game.time);
  game.obstacles = game.obstacles.filter((o) => o.active);
  game.pickups = game.pickups.filter((p) => p.active);

  // Collisions with hazards.
  const box = turkeyBox(turkey);
  if (box) {
    for (const obstacle of game.obstacles) {
      if (!obstacle.active || obstacle.kind === KIND_HAY) continue;
      const obstacleBox = { x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height };
      if (boxesOverlap(box, obstacleBox)) {
        obstacle.active = false;
        hurtTurkey(game);
        audio.hurt();
        if (game.screen !== SCREEN_PLAY) {
          audio.lose();
          return;
        }
      }
    }
  }
  // Pickups.
  if (box) {
    for (const pickup of game.pickups) {
      if (!pickup.active) continue;
      const pickupBox = { x: pickup.x, y: pickup.y + pickup.bob, width: pickup.width, height: pickup.height };
      if (boxesOverlap(box, pickupBox)) {
        pickup.active = false;
        if (pickup.kind === KIND_CORN) game.corn += 1;
        else if (pickup.kind === KIND_FEATHER) game.feathers += 1;
        game.pickupBonus += pickupScore(pickup.kind);
        audio.pickup(pickup.kind);
      }
    }
  }

  // The farmer caught up.
  if (game.farmer.gap <= 0 && !turkey.hiding) {
    endRun(game, SCREEN_CAUGHT);
    audio.lose();
    return;
  }
  // The forest gate: escaped.
  if (game.distance >= METRES_TO_ESCAPE) {
    endRun(game, SCREEN_ESCAPED);
    audio.win();
  }
}

/** One fixed step of the game. Input presses are consumed here. */
export function stepGame(game, input, audio) {
  if (input.wasPressed('mute')) {
    game.muted = audio.toggleMute();
  }
  if (game.screen === SCREEN_TITLE) {
    game.time += STEP;
    game.scroll += 24 * STEP;
    game.turkey.runPhase += STEP * 4;
    for (const click of input.takeClicks()) {
      if (clickIn(click, game.buttons.start)) {
        audio.unlock();
        audio.gobble();
        startRun(game);
        return;
      }
      if (clickIn(click, game.buttons.mute)) game.muted = audio.toggleMute();
    }
    if (input.wasPressed('jump') || input.wasPressed('confirm')) {
      audio.unlock();
      audio.gobble();
      startRun(game);
    }
    return;
  }
  if (game.screen === SCREEN_CAUGHT || game.screen === SCREEN_ESCAPED) {
    game.time += STEP;
    for (const click of input.takeClicks()) {
      if (clickIn(click, game.buttons.restart)) {
        audio.unlock();
        startRun(game);
        return;
      }
      if (clickIn(click, game.buttons.mute)) game.muted = audio.toggleMute();
    }
    if (input.wasPressed('restart') || input.wasPressed('confirm') || input.wasPressed('jump')) {
      audio.unlock();
      startRun(game);
    }
    return;
  }
  // Playing.
  for (const click of input.takeClicks()) {
    if (clickIn(click, game.buttons.mute)) game.muted = audio.toggleMute();
  }
  stepPlay(game, input, audio);
}

function clickIn(click, rect) {
  return (
    rect &&
    click.x >= rect.x &&
    click.x <= rect.x + rect.width &&
    click.y >= rect.y &&
    click.y <= rect.y + rect.height
  );
}
