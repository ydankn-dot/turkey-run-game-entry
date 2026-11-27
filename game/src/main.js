// Gobble Dash bootstrap: wire the canvas, the input and the sound to the
// game, then run the fixed-step loop. With ?shot=title|play|chase|end in
// the URL, stage that screenshot scene from the given seed instead and
// draw one frozen frame — that is how the entry's screenshots are taken.
import { makeAudio } from './audio.js';
import { makeGame, stepGame, STEP } from './game.js';
import { makeInput } from './input.js';
import { drawScene, VIEW_HEIGHT, VIEW_WIDTH } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || 7) || 7;
const shot = params.get('shot');

const game = makeGame(seed, 0);
const audio = makeAudio();

if (shot) {
  // Screenshot mode: no loop, no sound, one deterministic frame.
  const staged = stageShot(shot, game);
  game.best = Math.max(game.best, staged.best);
  drawScene(ctx, game);
} else {
  const input = makeInput(canvas);
  canvas.addEventListener('pointerdown', () => audio.unlock());
  let last = performance.now();
  let lag = 0;
  function frame(now) {
    const elapsed = Math.min(0.25, (now - last) / 1000);
    last = now;
    lag += elapsed;
    while (lag >= STEP) {
      stepGame(game, input, audio);
      lag -= STEP;
    }
    drawScene(ctx, game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
