# Gobble Dash — A Turkey's Great Escape

[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/ydankn-dot/turkey-run-game-entry/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/ydankn-dot/turkey-run-game-entry/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

Thanksgiving is coming, and the farmer is coming faster. **Gobble Dash** is a
2D canvas escape game: you are a turkey running 1000 metres from the farmyard,
through the barn and across the farmhouse kitchen, to the safety of the forest
— chased the whole way by the farmer, dodging his carving knives and the hot
oven.

## How to play

- **Space / ↑ / W** — jump (fences, pumpkins, mousetraps, the oven)
- **↓ / S** — slide under the thrown carving knives
- **H** — hide in a haystack when the farmer closes in
- **M** — mute, **R** — restart, mouse — buttons

Grab corn, pumpkin pie and golden feathers for points. You have 3 hearts: every
hit costs one and lets the farmer gain on you. Reach the forest gate to escape;
get caught and you are Thanksgiving dinner.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `game/` is plain static files, and every sound is
synthesised with WebAudio. The world is seeded and deterministic — the same
seed always deals the same escape.

## Layout

- `game/index.html` — the page and canvas
- `game/src/game.js` — rules, state machine, fixed-step loop
- `game/src/render.js` — all the art: farm, turkey, farmer, HUD, screens
- `game/src/entities.js` — turkey, farmer, hazards and pickups
- `game/src/levels.js` — the three stages and what each one throws at you
- `game/src/shots.js` — the deterministic screenshot scenes (`?shot=`)
- `game/src/rng.js`, `game/src/audio.js`, `game/src/input.js` — seeded RNG,
  synthesised sound, keyboard and mouse
- `main.ts` — the hand-in program (copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json`)

## Entry

Built for the [make.fun turkey escape game bounty](https://make.fun/bounty/turkey-run-game-01?ref=0a3zgsxr)
(`turkey-run-game-01`). License: MIT.
