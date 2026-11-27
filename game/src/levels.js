// The three stages of the escape, and what each one throws at the turkey.
// The turkey runs from the farmyard, through the barn, into the farmhouse
// kitchen, and out to the forest gate. Difficulty rises with distance: the
// ground speeds up, hazards come closer together, and the farmer gets
// bolder. Distances are in metres; one metre is 12 pixels of scrolling.
export const METRES_TO_ESCAPE = 1000;
export const PIXELS_PER_METRE = 12;

export const STAGES = [
  {
    id: 'farmyard',
    name: 'The Farmyard',
    from: 0,
    to: 300,
    skyTop: '#f7b267',
    skyBottom: '#f4845f',
    ground: '#c98f4e',
    groundDark: '#a9713a',
    accent: '#7fb069',
    hint: 'Jump the fences, duck the knives!',
  },
  {
    id: 'barn',
    name: 'The Barn',
    from: 300,
    to: 650,
    skyTop: '#e07a5f',
    skyBottom: '#8d5a3b',
    ground: '#b07a45',
    groundDark: '#8a5c31',
    accent: '#e9c46a',
    hint: 'Hide in the hay when the farmer closes in!',
  },
  {
    id: 'kitchen',
    name: 'The Kitchen',
    from: 650,
    to: 1000,
    skyTop: '#f2c14e',
    skyBottom: '#d97b29',
    ground: '#9c6644',
    groundDark: '#7d4f33',
    accent: '#e76f51',
    hint: 'Mind the oven — and the carving knife!',
  },
];

export function stageFor(distance) {
  for (const stage of STAGES) {
    if (distance < stage.to) return stage;
  }
  return STAGES[STAGES.length - 1];
}

/** Speed of the scrolling world in pixels per second at a distance. */
export function runSpeed(distance) {
  return 250 + Math.min(170, distance * 0.17);
}

/** Gap in pixels between spawned hazards at a distance. */
export function spawnGap(distance) {
  return Math.max(380, 620 - distance * 0.25);
}

// Hazard kinds. Each one names how the turkey beats it, so the autopilot
// and the player read the same rules.
export const KIND_FENCE = 'fence'; // jump it
export const KIND_KNIFE = 'knife'; // thrown at head height: duck under it
export const KIND_PUMPKIN = 'pumpkin'; // rolls along the ground: jump it
export const KIND_OVEN = 'oven'; // wide hot zone: jump clean over it
export const KIND_TRAP = 'trap'; // mousetrap on the ground: jump it
export const KIND_HAY = 'hay'; // haystack: hide inside, not a hazard

// Pickup kinds.
export const KIND_CORN = 'corn';
export const KIND_FEATHER = 'feather';
export const KIND_PIE = 'pie';

export const PICKUP_SCORE = {
  [KIND_CORN]: 10,
  [KIND_FEATHER]: 50,
  [KIND_PIE]: 25,
};

/** Which hazards a stage may spawn, with weights. */
export const STAGE_HAZARDS = {
  farmyard: [
    [KIND_FENCE, 5],
    [KIND_KNIFE, 3],
    [KIND_PUMPKIN, 3],
    [KIND_TRAP, 2],
    [KIND_HAY, 2],
  ],
  barn: [
    [KIND_FENCE, 4],
    [KIND_KNIFE, 4],
    [KIND_PUMPKIN, 4],
    [KIND_TRAP, 2],
    [KIND_HAY, 4],
    [KIND_OVEN, 1],
  ],
  kitchen: [
    [KIND_KNIFE, 5],
    [KIND_OVEN, 4],
    [KIND_PUMPKIN, 2],
    [KIND_TRAP, 3],
    [KIND_FENCE, 2],
    [KIND_HAY, 2],
  ],
};

export function pickHazard(rng, stageId) {
  const table = STAGE_HAZARDS[stageId];
  let total = 0;
  for (const [, weight] of table) total += weight;
  let roll = rng.next() * total;
  for (const [kind, weight] of table) {
    roll -= weight;
    if (roll <= 0) return kind;
  }
  return table[0][0];
}
